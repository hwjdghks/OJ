# config.py
import os

ENVIRON = {
    'rabbitmq': {
        'host': os.getenv('RABBITMQ_HOST'),
        'user': os.getenv('RABBITMQ_USER'),
        'password': os.getenv('RABBITMQ_PASSWORD'),
        'send_queue': os.getenv('RABBITMQ_CORE_TO_BACKEND'),
        'recv_queue': os.getenv('RABBITMQ_BACKEND_TO_CORE')
    },
    'openai': {
        'api_key': os.getenv('USER_API'),
        'org_id': os.getenv('OPENAI_ORG_ID'),
        'proj_id': os.getenv('OPENAI_PROJECT_ID')
    }
}

LANGUAGE_CONFIG = {
    'C': {
        'file_name': 'c',
        'file_ext': 'c',
        'compile_cmd': 'gcc -o Main Main.c',
        'execute_cmd': './Main',
        'memory_factor': [1, 0],
        'time_factor': [1, 0]
    },
    'C++': {
        'file_name': 'cpp',
        'file_ext': 'cpp',
        'compile_cmd': 'g++ -o Main Main.cpp',
        'execute_cmd': './Main',
        'memory_factor': [1, 0],
        'time_factor': [1, 0]
    },
    'Python': {
        'file_name': 'python',
        'file_ext': 'py',
        'compile_cmd': 'python3 -c "import py_compile; py_compile.compile(r"Main.py")"',
        'execute_cmd': 'python3 Main.py',
        'memory_factor': [3, 32], # multi, plus (MB)
        'time_factor': [3, 3] # multi, plus (second)
    },
    'Java': {
        'file_name': 'java',
        'file_ext': 'java',
        'compile_cmd': 'javac -release 11 -J-Xms1024m -J-Xmx1920m -J-Xss512m -encoding UTF-8 Main.java',
        'execute_cmd': 'java -Xms1024m -Xmx1920m -Xss512m -Dfile.encoding=UTF-8 -XX:+UseSerialGC Main',
        'memory_factor': [3, 32], # multi, plus (MB)
        'time_factor': [3, 3] # multi, plus (second)
    },
}

ROLES = {
    'system_role': '''
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
}