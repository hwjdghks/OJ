from config import ENVIRON
from GradeInfo import GradeInfo
import utils
import dockerutils
import aiutils
import json

from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic

def grade(ch: BlockingChannel, method: Basic.Deliver, properties, body):
    config = ENVIRON.get('rabbitmq')
    info = GradeInfo(**json.loads(body))
    standard_result = standard_grade(info)
    if standard_result == 10:
        ai_result = ai_grade(info)
    else:
        ai_result = None
    info.set_response(standard_result, ai_result)
    ch.basic_publish(
        exchange='',
        routing_key=config['send_queue'],
        body=info.response
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)


def standard_grade(info: GradeInfo):
    utils.setup_grade_environment(info)
    return dockerutils.major_grade_process(info)


def ai_grade(info: GradeInfo):
    return aiutils.judge_ai(info)