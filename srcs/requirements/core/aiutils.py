from openai import OpenAI
from config import ENVIRON
from config import ROLES
from GradeInfo import GradeInfo

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
    pass


def _judge_algorithm(client: OpenAI, info: GradeInfo):
    content = {
        'description': info.description,
        'language' : info.language,
        'source code': info.code_content,
        'keyword': info.keyword,
        'grade guide': info.grade_guide
    }
    return _chat(client, ROLES.get('system_role'), json.dumps(content))


def judge_ai(info: GradeInfo):
    client = _init_client()
    # result = _judge_hardcode(client, info)
    # if (result == 'YES'):
    #     return result
    result = _judge_algorithm(client, info)
    print(result)
    print("="*100)
    print('')
    # return ai_res.choices[0].message.content
    return 'test'