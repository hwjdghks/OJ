import pika
from pika.channel import Channel
from pika.spec import Basic, BasicProperties
import os
import json
import multiprocessing
import time
import psutil
import docker
from pprint import pprint

rabbit_host = os.getenv('RABBITMQ_HOST')
rabbit_user = os.getenv('RABBITMQ_USER')
rabbit_password = os.getenv('RABBITMQ_PASSWORD')

def process_message(message):
    # 10초 걸리는 작업 시뮬레이션
    print(message)
    data = json.loads(message)
    print(data)
    id = data['submit_id']
    return str(id)

def process(data: str):
    try:
        client = docker.from_env()
    except docker.errors.DockerException as e:
        print(f"Docker 연결 오류: {e}")
        return

    id = data['id']
    submit_id = data['submit_id']
    language = data['language']

    with open(f"code_{submit_id}.c", "w") as code:
        code.write(data['code'])

    valid_language_tag = ''.join(c for c in language.lower() if c.isalnum() or c in ('-', '_', '.'))
    tag = f'score-{valid_language_tag}:1.0'

    try:
        # 기본 이미지 빌드
        client.images.build(path='.', dockerfile=f'{language}.Dockerfile', tag=tag)
    except Exception as e:
        print(f"기본 이미지 빌드 오류: {e}")
        return

    score_file = f"""
FROM {tag}
COPY ./code_{submit_id}.c .
RUN gcc code_{submit_id}.c
COPY ./data/{id}/in ./in
COPY ./data/{id}/out ./out
CMD ["bash", "run.sh"]
"""
    print(score_file)
    dockerfile_path = f"score_{submit_id}.Dockerfile"
    with open(dockerfile_path, "w") as dockerfile:
        dockerfile.write(score_file)
    # 현재 디렉토리 경로
    current_directory = os.getcwd()

    # 현재 디렉토리에 있는 파일과 디렉토리 목록
    files_and_directories = os.listdir(current_directory)

# 목록 출력
    for item in files_and_directories:
        print(item)
    score_tag = f'jhwang_{submit_id}:{id}'.lower()
    print(f"이미지 태그로 빌드: {score_tag}")

    try:
        image, _ = client.images.build(path='.', dockerfile=dockerfile_path, tag=score_tag)
    except Exception as e:
        print(f"빌드 오류: {e}")
        exit(44)

    try:
        container = client.containers.run(
            image=image.id,
            name=f'jhwang-{submit_id}',
            detach=True,
            security_opt=["no-new-privileges"],
            read_only=True,
            user='score'
        )
        print(f'컨테이너 시작됨: {container.id}')
        logs = container.logs(stdout=True, stderr=True)
        print(f'컨테이너 로그: {logs.decode("utf-8")}')

        container.wait()
        exit_code = container.wait()['StatusCode']
        print(f'컨테이너 종료 코드: {exit_code + 127}')
        return str(exit_code + 127)
    except Exception as e:
        print(f"컨테이너 실행 오류: {e}")
        return

def callback(ch: Channel, method: Basic.Deliver, properties: BasicProperties, body: bytes):
    print(f" [{ch.channel_number}] Received {body}")
    print("Method:")
    pprint(vars(method))
    print("Properties:")
    pprint(vars(properties))
    print("Body:")
    pprint(json.loads(body.decode()))
    result = process(json.loads(body.decode()))

    # 결과를 message 큐로 전송
    ch.basic_publish(exchange='',
                     routing_key='message',
                     body=result)
    print(f" [{ch.channel_number}] Sent {result}")

    # 메시지 처리 완료 확인
    ch.basic_ack(delivery_tag=method.delivery_tag)

def worker(worker_id):
    credentials = pika.PlainCredentials(rabbit_user, rabbit_password)
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbit_host, credentials=credentials))
    channel = connection.channel()

    channel.queue_declare(queue='my_queue')
    channel.queue_declare(queue='message')

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='my_queue', on_message_callback=callback)

    print(f' [*] Worker {worker_id} waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

def main():
    cpu_cores = psutil.cpu_count()
    print(f"cpu_cores: {cpu_cores}")
    num_workers = cpu_cores  # 원하는 워커 수를 지정하세요
    workers = []

    for i in range(num_workers):
        p = multiprocessing.Process(target=worker, args=(i,))
        workers.append(p)
        p.start()

    for p in workers:
        p.join()

if __name__ == '__main__':
    time.sleep(15)
    current_path = os.getcwd()
    print("현재 경로 위치:", current_path)
    main()