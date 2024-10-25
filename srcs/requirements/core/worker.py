import pika
from config import ENVIRON
from grade import grade

def worker(worker_id):
    config = ENVIRON.get('rabbitmq')
    credentials = pika.PlainCredentials(config['user'], config['password'])
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=config['host'],
            credentials=credentials,
            connection_attempts=30,
            retry_delay=5
        )
    )
    channel = connection.channel(worker_id)

    channel.queue_declare(queue=config['send_queue'])
    channel.queue_declare(queue=config['recv_queue'])

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=config['recv_queue'], on_message_callback=grade)

    print('[*] Worker {0:d} waiting for messages. To exit press CTRL+C'.format(worker_id))
    channel.start_consuming()