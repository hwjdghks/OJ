import pika
import os
import json
import multiprocessing
import time
import psutil

rabbit_host = os.getenv('RABBITMQ_HOST')
rabbit_user = os.getenv('RABBITMQ_USER')
rabbit_password = os.getenv('RABBITMQ_PASSWORD')

def process_message(message):
    # 10초 걸리는 작업 시뮬레이션
    time.sleep(10)
    data = json.loads(message)
    id = data.get('submit_id')
    return str(id)

def callback(ch, method, properties, body):
    print(f" [{ch.channel_number}] Received {body}")
    result = process_message(body.decode())

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
    main()