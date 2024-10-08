from pika.channel import Channel
from pika.spec import Basic, BasicProperties
import json
import docker
import shutil
import os
from pprint import pprint
from grade_info import grade_info
from openai import OpenAI

# 채점 서버용 파일 세팅 따로 만들기
# 채점 서버용 도커 이미지 파일 따로 만들기
# 채점 서버용 도커 이미지 파일 빌드, 실행 따로 만들기
# AI 부분 따로 만들기
# 뒷정리 및 결과 전송 등 따로 만들기
# 각 파트 예외처리 넣기

rabbit_send_queue = os.getenv('RABBITMQ_CORE_TO_BACKEND')

def grade_code(ch: Channel, method: Basic.Deliver, properties: BasicProperties, body: bytes):
    # 채점 정보 세팅
    info = grade_info(json.loads(body))

    # 채점에 필요한 파일들 저장할 디렉터리 만들기 (submit id)
    grade_dir_path = f'/app/{info.submit_id}'
    os.makedirs(grade_dir_path, exist_ok=True)

    # 채점 데이터 복사
    origin_data = f'tools/data/{info.problem_id}'
    shutil.copytree(origin_data, grade_dir_path, dirs_exist_ok=True)

    # 채점할 코드 파일로 만들기 (Main.{ext})
    submit_file = f'{grade_dir_path}/{info.grade_file}.{info.file_ext}'
    with open(submit_file, 'w') as file:
        file.write(info.source)

    # 채점 서버용 도커 파일 만들기
    grade_server_docker = f'''
FROM {info.util_file}:base
ENV TIMEOUT={info.time * info.time_limit[0] + info.time_limit[1]}
ENV MEMOUT={1024 * (info.memory * info.memory_limit[0] + info.memory_limit[1])}
COPY . .
ENTRYPOINT ["bash", "run.sh"]
'''
    new_docker_file = f'{grade_dir_path}/Dockerfile'
    with open(new_docker_file, 'w') as file:
        file.write(grade_server_docker)

    # 도커 파일 빌드
    client = docker.from_env()
    image, _ = client.images.build(
        path=grade_dir_path,                        # 빌드 컨텍스트 경로 설정
        tag=f'{info.submit_id}:{info.util_file}',   # 이미지 태그 설정
        rm=True                                     # 임시 컨테이너 삭제
        )

    # 이미지 실행
    try:
        container = client.containers.run(
            image=image.id,
            name=f'grade-{info.submit_id}',
            detach=True,
            security_opt=["no-new-privileges"],
            # read_only=True,
            user='grade',
            init=True,
            network_disabled=True,
        )
        print(f'컨테이너 시작됨: {container.id}')

        # 결과 취합
        exit_code = container.wait(timeout=30)
        pprint(exit_code)
        exit_code = exit_code['StatusCode']
    except Exception as e:
        print("OJ error:", e)
        exit_code = 50
    logs = container.logs(stdout=True, stderr=True)
    print(f'컨테이너 로그: {logs.decode("utf-8")}')

    print(f'컨테이너 종료 코드: {exit_code}')

    # 정리
    container.stop()
    container.remove()
    client.images.remove(image=image.id)
    if os.path.exists(grade_dir_path):
        shutil.rmtree(grade_dir_path)
    ai_res = None
    api_key = os.getenv('USER_API')
    org_ID = os.getenv('OPENAI_ORG_ID')
    project_ID = os.getenv('OPENAI_PROJECT_ID')
    # AI 결과 생성 준비
    if exit_code == 10:
        client = OpenAI(
            api_key=api_key,
            organization=org_ID,
            project=project_ID,
        )
        content = {
            'source code': info.source,
            'keyword': info.keyword,
            'grade guide': info.grade_guide
        }
        ai_res = client.chat.completions.create(
            messages=[
            {
                'role': 'system',
                'content': '''너의 역할은 사용자가 제출한 소스 코드가 주어진 알고리즘을 사용하여 구현되었는지, 또는 하드코딩으로 문제를 해결하려 했는지 검증하는 것이다. 주어진 자료와 핵심 알고리즘 키워드를 참고하여 소스 코드를 분석한 후, 다음과 같은 형식으로 응답하라:
- "정확" (적절한 알고리즘이 사용된 경우)
- "부정확" (적절한 알고리즘이 사용되지 않은 경우)
- "우회" (알고리즘을 우회하거나 정답을 하드코딩한 경우)

각 소스 코드의 구현 방식을 간결하게 판단하고, 그에 맞는 적절한 단답형 응답을 제공하라.
'''
            },
            {
                'role': 'user',
                'content': json.dumps(content)
            },
            ],
            model='gpt-4o-mini',
            n=1,
        )
    # 결과 메세지로 발송
    _dict_response = {
        'code_id': info.submit_id,
        'submit_result': exit_code,
        'ai_result': ai_res.choices[0].message.content if ai_res else 'no start'
    }
    response = json.dumps(_dict_response)
    ch.basic_publish(
        exchange='',
        routing_key=rabbit_send_queue,
        body=response
    )

    # 메시지 처리 완료 확인
    ch.basic_ack(delivery_tag=method.delivery_tag)
    print(f" [{ch.channel_number}] Sent {exit_code}")

