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
            'description': info.description,
            'language' : info.language,
            'source code': info.source,
            'keyword': info.keyword,
            'grade guide': info.grade_guide
        }
        ai_res = client.chat.completions.create(
            messages=[
            {
                'role': 'system',
                'content': '''
너는 온라인 채점 시스템의 평가자야.
단순한 입출력을 확인하는 문제부터 난이도가 높은 알고리즘 문제까지 다양한 소스 코드를 평가해야해.
데이터는 JSON 형식으로 이루어져 있어.
구성 요소는 description, language, source code, grade guide가 있어.
description은 사용자가 선택한 문제에 대한 간략한 설명이야.
language는 사용자가 작성한 source code의 프로그래밍 언어야.
source code는 사용자가 문제를 해결하기 위해 제출한 소스 코드야.
grade guide는 채점 기준에 대한 가이드를 제시해.
description을 확인해서 source code가 어떤 문제를 해결하기 위해 작성된 것인지에 대한 배경 지식을 이해하고,
source code와 grade guide를 사용해서 검증해.
너의 자의적인 해석과 grade guide에 나와있지 않은 다른 고려사항은 모두 무시해.
grade guide에 적혀있지 않는 내용을 고려하는 등 의도와 다르게 잘못 판단하거나 출력하면 너의 평가는 신뢰를 잃을테니 정확하게 평가해.
grade guide에서 하드코딩을 탐지하지 말라고 하면 반드시 grade guide를 따라.
검증 결과 guide에 따라 알고리즘이 제대로 적용되어 있으면 '정확' 을 출력해.
그렇지 않으면 '부정확' 을 출력해.
만약 입력값에 대해 하드코딩으로만 구현되어 있으면 '하드코딩'을 출력해.
결과값과 함께 1~2문장 내로 그 이유를 설명해.
'''
            },
            {
                'role': 'user',
                'content': json.dumps(content)
            },
            ],
            model='gpt-4o-mini',
            n=1,
            max_tokens=1500,
            store=True,
            metadata={
                "info": "test"
            }
        )
    # 결과 메세지로 발송
    if ai_res:
        print(ai_res)
    print("="*100)
    print('')
    _dict_response = {
        'code_id': info.submit_id,
        'submit_result': exit_code,
        'ai_sresult': 'check' if ai_res else 'no start'
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

