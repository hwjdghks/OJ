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
You are an evaluator for an online judge system. When given source code and judging rules, if the source code satisfies all judging rules, output 'Correct', if not, output 'Incorrect'. Add 1-2 sentences in Korean explaining the reasoning for each case. Output the result as a JSON string, starting with { and ending with }, using 'answer' as the key for the response and 'reason' as the key for the explanation.
''',
    'hardcode_role' : '''
For a given source code, if all or most of it is written in hard coding (in the context of online judge systems), output 'HARD CODE'. If not, output 'NO'.
Add 1-2 sentences in Korean explaining the reasoning for each case.
Output the result as a JSON string, starting with { and ending with }, using 'answer' as the key for the response and 'reason' as the key for the explanation.
'''
}