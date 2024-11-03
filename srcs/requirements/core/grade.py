from config import ENVIRON
from GradeInfo import GradeInfo
from problems import create, get_data
import utils
import dockerutils
import aiutils
import json

from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic

def grade_handler(ch: BlockingChannel, method: Basic.Deliver, properties, body):
    print('핸들러 실행')
    data = json.loads(body)
    op = data.get('operation')
    if op == 'grade':
        element = data.get('data')
        grade(ch, element)
    elif op == 'create':
        problem_id = data.get('problem_id')
        element = data.get('data')
        create(problem_id, element)
    elif op == 'update':
        problem_id = data.get('problem_id')
        request_id = data.get('requestId')
        response = get_data(problem_id, request_id)
        print('make response:', response)
        config = ENVIRON.get('rabbitmq')
        ch.basic_publish(
        exchange='',
        routing_key=config['send_queue'],
        body=response
        )
    ch.basic_ack(delivery_tag=method.delivery_tag)


def grade(ch: BlockingChannel, element):
    print('채점 시퀀스 시작')
    config = ENVIRON.get('rabbitmq')
    info = GradeInfo(**element)
    standard_result, log = standard_grade(info)
    if standard_result == 10:
        ai_result = ai_grade(info)
    else:
        ai_result = None
    info.set_response(standard_result, log, ai_result)
    ch.basic_publish(
        exchange='',
        routing_key=config['send_queue'],
        body=info.response
    )


def standard_grade(info: GradeInfo):
    print('기본 채점 시작')
    utils.setup_grade_environment(info)
    return dockerutils.major_grade_process(info)


def ai_grade(info: GradeInfo):
    print('AI 검증 시작')
    return aiutils.judge_ai(info)