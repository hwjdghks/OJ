from openai import OpenAI
from config import ENVIRON
from config import ROLES
from GradeInfo import GradeInfo
import json

def _init_client():
    config = ENVIRON.get('openai')
    return OpenAI(
        api_key=config['api_key'],
        organization=config['org_id'],
        project=config['proj_id'],
    )


def _chat(client: OpenAI, system_role: str, user_role: str):
    result = client.chat.completions.create(
        messages=[
        {
            'role': 'system',
            'content': system_role
        },
        {
            'role': 'user',
            'content': user_role
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
    return result.choices[0].message.content


def _judge_hardcode(client: OpenAI, info: GradeInfo):
    content = f'''
소스코드:
{info.code_content}
'''
    return _chat(client, ROLES.get('hardcode_role'), json.dumps(content))


def _judge_algorithm(client: OpenAI, info: GradeInfo):
    content = f'''
소스코드:
{info.code_content}

채점 규칙:
{info.grade_guide}
'''
    return _chat(client, ROLES.get('system_role'), json.dumps(content))


def judge_ai(info: GradeInfo):
    client = _init_client()
    result = _judge_hardcode(client, info)
    print('하드코딩 탐지 결과:', result)
    print('')
    result_dict = json.loads(result)
    answer = result_dict.get('answer')
    if (answer == 'HARD CODE'):
        return result
    result = _judge_algorithm(client, info)
    print('알고리즘 검증 결과:', result)
    print("="*100)
    print('')
    # return ai_res.choices[0].message.content
    return result