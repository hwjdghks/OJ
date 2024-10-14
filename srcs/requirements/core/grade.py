import utils
import docker_utils
from config import environ


def grade(ch, method, properties, body):
    dir_path, info = utils.setup_grade_environment(body)
    result = docker_utils.major_grade_process(dir_path, info)
    response = utils.set_response(info, result)
    ch.basic_publish(
        exchange='',
        routing_key=environ['rabbitmq']['send_queue'],
        body=response
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)


def static_grade():
    pass


def ai_grade():
    pass
