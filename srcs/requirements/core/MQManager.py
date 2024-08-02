import asyncio
import aio_pika
import os

class MQMananger:
    def __init__(self) -> None:
        self.host = os.getenv('RABBITMQ_HOST')
        self.user = os.getenv('RABBITMQ_USER')
        self.password = os.getenv('RABBITMQ_PASSWORD')
        self.url = f'amqp://{self.user}:{self.password}@{self.host}'
        self.connection = None
        self.sessions = {}

    async def connect(self):
        try:
            self.connection = await aio_pika.connect_robust(self.rabbit_url)
            print("Connected to RabbitMQ")
        except aio_pika.exceptions.AioPikaError as e:
            print(f"Failed to connect to RabbitMQ: {e}")
            raise

    async def create_channel(self):
        pass

    async def create_queue(self, queue_name):
        pass

    async def create_consumer(self, body):
        pass

    async def create_producer(self, body):
        pass

    async def run_session(self, body):
        pass
    
    async def close(self):
        pass

    async def close_channel(self):
        pass

    async def close_queue(self, queue_name):
        pass
    
    async def close_consumer(self, body):
        pass

    async def close_producer(self, body):
        pass
