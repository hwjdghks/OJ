from pika.channel import Channel
from pika.spec import Basic, BasicProperties
import json
import docker
import shutil
import os
from pprint import pprint
from grade_info import grade_info

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
COPY . .
RUN {info.compile}
ENTRYPOINT ["bash", "run.sh"]
'''
    new_docker_file = f'{grade_dir_path}/Dockerfile'
    with open(new_docker_file, 'w') as file:
        file.write(grade_server_docker)

    client = docker.from_env()

    image_id = None
    exit_code = 1  # Default to 1 (failure) unless set otherwise

    last_stream_log = None
    try:
        # 도커 파일 빌드
        build_stream = client.api.build(
            path=grade_dir_path,
            tag=f'{info.submit_id}:{info.util_file}',
            decode=True,
            rm=True
        )

        for chunk in build_stream:
            if 'stream' in chunk:
                print(chunk['stream'], end='')
                last_stream_log = chunk['stream']  # 저장하여 마지막 stream 추적
            elif 'error' in chunk:
                print(f"Build error: {chunk['error']}", end='')
            elif 'status' in chunk:
                print(f"Status: {chunk['status']}", end='')
            elif 'aux' in chunk:
                aux = chunk['aux']
                if 'ID' in aux:
                    image_id = aux['ID']
                    print(f"Image ID: {image_id}")

        if not image_id:
            raise RuntimeError("Failed to get image ID from build stream")

        # 이미지 실행
        container = client.containers.run(
            image=image_id,
            name=f'grade-{info.submit_id}',
            detach=True,
            security_opt=["no-new-privileges"],
            read_only=True,
            user='score',
            init=True
        )
        print(f'컨테이너 시작됨: {container.id}')

        # 결과 취합
        exit_code = container.wait()
        logs = container.logs(stdout=True, stderr=True)
        print(f'컨테이너 로그: {logs.decode("utf-8")}')

        exit_code = exit_code['StatusCode']
        print(f'컨테이너 종료 코드: {exit_code}')

    except docker.errors.BuildError as e:
        print(f"Build error: {str(e)}")
    except docker.errors.ContainerError as e:
        print(f"Container error: {str(e)}")
    except docker.errors.APIError as e:
        print(f"API error: {str(e)}")
    finally:
        # 정리
        if image_id:
            try:
                client.images.remove(image=image_id, force=True)
            except docker.errors.ImageNotFound:
                print(f"Image {image_id} not found for removal.")
            except docker.errors.APIError as e:
                print(f"Error removing image: {str(e)}")

        if 'container' in locals():
            try:
                container.stop()
                container.remove()
            except docker.errors.APIError as e:
                print(f"Error removing container: {str(e)}")

        if os.path.exists(grade_dir_path):
            shutil.rmtree(grade_dir_path)

        # 마지막 빌드 에러 로그 출력
        if last_stream_log:
            print(f"마지막 빌드 로그: {last_stream_log}")
    
        # 결과 메세지로 발송
        _dict_response = {
            'submit_id': info.submit_id,
            'result': exit_code
        }
        response = json.dumps(_dict_response)
        ch.basic_publish(
            exchange='',
            routing_key='message',
            body=response
        )

        # 메시지 처리 완료 확인
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print(f" [{ch.channel_number}] Sent {exit_code}")
