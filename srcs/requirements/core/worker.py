import pika
from config import environ
from grade import grade

def worker(worker_id):
    credentials = pika.PlainCredentials(environ['rabbitmq']['user'], environ['rabbitmq']['password'])
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=environ['rabbitmq']['host'],
            credentials=credentials,
            connection_attempts=30,
            retry_delay=5
        )
    )
    channel = connection.channel(worker_id)

    channel.queue_declare(queue=environ['rabbitmq']['send_queue'])
    channel.queue_declare(queue=environ['rabbitmq']['recv_queue'])

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=environ['rabbitmq']['recv_queue'], on_message_callback=grade)

    print('[*] Worker {0:d} waiting for messages. To exit press CTRL+C'.format(worker_id))
    channel.start_consuming()