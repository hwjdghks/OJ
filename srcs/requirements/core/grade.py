from config import ENVIRON
from GradeInfo import GradeInfo
import utils
import dockerutils
import json
from openai import OpenAI
from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic

def grade(ch: BlockingChannel, method: Basic.Deliver, properties, body):
    config = ENVIRON.get('rabbitmq')
    info = GradeInfo(json.loads(body))
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
    config = ENVIRON.get['openai']
    api_key = config['api_key']
    org_ID = config['org_id']
    project_ID = config['proj_id']
    # AI 결과 생성 준비
    client = OpenAI(
            api_key=api_key,
            organization=org_ID,
            project=project_ID,
    )
    content = {
            'description': info.description,
            'language' : info.language,
            'source code': info.code_content,
            'keyword': info.keyword,
            'grade guide': info.grade_guide
        }
    ai_res = client.chat.completions.create(
            messages=[
            {
                'role': 'system',
                'content': '''
너는 온라인 채점 시스템의 평가자야.
단순한 입출력을 확인하는 문제부터 난이도가 높은 알고리즘 문제까지 다양한 소스 코드를 평가해야해.
데이터는 JSON 형식으로 이루어져 있어.
구성 요소는 description, language, source code, grade guide가 있어.
description은 사용자가 선택한 문제에 대한 간략한 설명이야.
language는 사용자가 작성한 source code의 프로그래밍 언어야.
source code는 사용자가 문제를 해결하기 위해 제출한 소스 코드야.
grade guide는 채점 기준에 대한 가이드를 제시해.
description을 확인해서 source code가 어떤 문제를 해결하기 위해 작성된 것인지에 대한 배경 지식을 이해하고,
source code와 grade guide를 사용해서 검증해.
너의 자의적인 해석과 grade guide에 나와있지 않은 다른 고려사항은 모두 무시해.
grade guide에 적혀있지 않는 내용을 고려하는 등 의도와 다르게 잘못 판단하거나 출력하면 너의 평가는 신뢰를 잃을테니 정확하게 평가해.
grade guide에서 하드코딩을 탐지하지 말라고 하면 반드시 grade guide를 따라.
검증 결과 guide에 따라 알고리즘이 제대로 적용되어 있으면 '정확' 을 출력해.
그렇지 않으면 '부정확' 을 출력해.
만약 입력값에 대해 하드코딩으로만 구현되어 있으면 '하드코딩'을 출력해.
결과값과 함께 1~2문장 내로 그 이유를 설명해.
'''
            },
            {
                'role': 'user',
                'content': json.dumps(content)
            },
            ],
            model='gpt-4o-mini',
            n=1,
            max_tokens=1500,
            store=True,
            metadata={
                "info": "test"
            }
    )
    # 결과 메세지로 발송
    if ai_res:
        print(ai_res)
    print("="*100)
    print('')
    # return ai_res.choices[0].message.content
    return 'test'