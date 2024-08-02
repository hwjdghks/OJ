import asyncio
import aio_pika
import os
import time

rabbit_host = os.getenv('RABBITMQ_HOST', 'localhost')
rabbit_user = os.getenv('RABBITMQ_USER', 'guest')
rabbit_password = os.getenv('RABBITMQ_PASSWORD', 'guest')

async def process_message(message_body):
    print(f"Processing message: {message_body}")
    if "error" in message_body:
        raise ValueError("Simulated processing error")
    await asyncio.sleep(1)  # Simulate a long-running task

async def main():
    connection = None
    try:
        print(f"Attempting to connect to RabbitMQ at amqp://{rabbit_user}:{rabbit_password}@{rabbit_host}...")
        connection = await aio_pika.connect_robust(f"amqp://{rabbit_user}:{rabbit_password}@{rabbit_host}")
        print("Message Queue connected.")
        async with connection:
            async with connection.channel() as channel:  # Create a new channel
                print("Channel created.")
                queue = await channel.declare_queue("my_queue")  # Declare the queue
                print("Queue declared.")
                async for message in queue:
                    try:
                        async with message.process():  # Start processing the message
                            await process_message(message.body.decode())  # Process the message content
                            # If processing is successful, the message is acknowledged (ack) automatically
                    except Exception as e:
                        print(f"Error processing message: {e}")
                        # If an error occurs, nack the message to requeue it for processing
                        await message.nack(requeue=True)  # The message will be moved to the end of the queue
    except aio_pika.exceptions.AMQPConnectionError as e:
        print(f"AMQP Connection Error: {e}")
    except Exception as e:
        print(f"Unexpected Error: {e}")
    finally:
        if connection:
            await connection.close()  # Ensure the connection is closed

if __name__ == "__main__":
    print("Sleeping before start...")
    time.sleep(15.0)
    asyncio.run(main())
