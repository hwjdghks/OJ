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
        'compile_cmd': 'gcc -o Main -O2 Main.c',
        'execute_cmd': './Main',
        'memory_factor': [1, 0],
        'time_factor': [1, 0]
    },
    'C++': {
        'file_name': 'cpp',
        'file_ext': 'cpp',
        'compile_cmd': 'g++ -o Main -O2 Main.cpp',
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
        'time_factor': [5, 3] # multi, plus (second)
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
사용자가 제출한 소스 코드와 채점 규칙을 제공하면 소스 코드가 채점 규칙을 모두 만족하면 '정확', 그렇지 않으면 '부정확'을 출력해.
그리고 각각의 사유에 대해 1~2문장 정도의 근거를 덧붙여줘.
''',
    'hardcode_role' : '''

주어진 소스 코드의 전체 또는 대부분이 하드코딩으로 작성되어 있으면 'YES'를 출력하고 그렇지 않으면 'NO'를 출력해.
'''
}