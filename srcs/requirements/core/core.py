import pika
from pika.channel import Channel
from pika.spec import Basic, BasicProperties
import os
import json
import multiprocessing
import psutil
import docker
from callback import grade_code

rabbit_host = os.getenv('RABBITMQ_HOST')
rabbit_user = os.getenv('RABBITMQ_USER')
rabbit_password = os.getenv('RABBITMQ_PASSWORD')
rabbit_send_queue = os.getenv('RABBITMQ_CORE_TO_BACKEND')
rabbit_recv_queue = os.getenv('RABBITMQ_BACKEND_TO_CORE')
def worker(worker_id):
    credentials = pika.PlainCredentials(rabbit_user, rabbit_password)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=rabbit_host,
            credentials=credentials,
            connection_attempts=10,
            retry_delay=2
        )
    )
    channel = connection.channel(worker_id)

    channel.queue_declare(queue=rabbit_send_queue)
    channel.queue_declare(queue=rabbit_recv_queue)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=rabbit_recv_queue, on_message_callback=grade_code)

    print(f' [*] Worker {worker_id} waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

def main():
    cpu_cores = psutil.cpu_count()
    print(f"cpu_cores: {cpu_cores}")

    docker_client = docker.from_env()
    language_list = ('c', 'cpp', 'python', 'java')
    for language in language_list:
        print("build docker image:", language)
        image, logs = docker_client.images.build(path='./tools', # 빌드 컨텍스트 경로 설정
                                   dockerfile=f'Dockerfiles/{language}.Dockerfile', # 빌드할 도커 파일 설정
                                   tag=f'{language}:base', # 이미지 태그 설정
                                   rm=True # 임시 컨테이너 삭제
                                   )
        print("Image ID:  ", image.id)
        print("Image tags:", image.tags)
        print('\n')
    docker_client.close()

    num_workers = cpu_cores  # 원하는 워커 수를 지정하세요
    workers = []

    for i in range(num_workers):
        p = multiprocessing.Process(target=worker, args=(i,))
        workers.append(p)
        p.start()

    for p in workers:
        p.join()

if __name__ == '__main__':
    main()