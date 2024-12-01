from openai import OpenAI
from config import ENVIRON
from config import ROLES
from GradeInfo import GradeInfo
from collections import Counter
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
        temperature=0.3,
        max_completion_tokens=2000,
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
    print(f'[{info.tag_name}] 하드코딩 탐지 결과:', result)
    print('')
    result_dict = json.loads(result)
    answer = result_dict.get('answer')
    if (answer == 'HARD CODE'):
        return result
    answers = []
    results = []
    for idx in range(5):
        result = _judge_algorithm(client, info)
        result_dict = json.loads(result)
        answers.append(result_dict.get('answer'))
        results.append(result_dict)
        print(f'[{info.tag_name}] 알고리즘 검증 결과 {idx + 1}:', result)
        print('')

    # Determine the most common answer for the algorithm check
    most_common_answer, _ = Counter(answers).most_common(1)[0]

    # Find one of the results that matches the most common answer
    final_result = next(res for res in results if res.get('answer') == most_common_answer)
    print('최종 답변:', final_result)
    print("="*100)
    print('')
    return json.dumps(final_result)