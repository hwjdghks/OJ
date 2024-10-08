import json

# 언어별 특징 DB로 관리할지 고려하기
class grade_info:
    def __init__(self, data: dict):
        self.problem_id = data['problem_id']    # problem id
        self.submit_id = data['submit_id']      # submit id
        self.language = data['language']        # source code language
        self.source = data['code_content']      # source code
        self.time = data['time_limit']          # problem time limit
        self.memory = data['memory_limit']      # problem memory limit
        self.grade_file = 'Main'                # excutive file name
        self.keyword = data['keyword']
        self.grade_guide = data['grade_guide']

        self.util_file = ''                     # utility fime name
        self.file_ext = ''                      # source file extension
        self.compile = ''                       # compile command
        self.run = ''                           # run command
        self.time_limit = []                    # time limit [multiplier, addition] (input * [0] + [1])
        self.memory_limit = []                  # memory limit [multiplier, addition] (input * [0] + [1])
        self.extract_info_from_language(self.language)

    def extract_info_from_language(self, language: str):
        if language == 'C':
            self.util_file = 'c'
            self.file_ext = 'c'
            self.compile = f'gcc -o {self.grade_file} {self.grade_file}.{self.file_ext}'
            self.run = f'./{self.grade_file}'
            self.time_limit = [1, 0]
            self.memory_limit = [1, 0]
        elif language == 'C++':
            self.util_file = 'cpp'
            self.file_ext = 'cpp'
            self.compile = f'g++ -o {self.grade_file} {self.grade_file}.{self.file_ext}'
            self.run = f'./{self.grade_file}'
            self.time_limit = [1, 0]
            self.memory_limit = [1, 0]
        elif language == 'Python':
            self.util_file = 'python'
            self.file_ext = 'py'
            self.compile = f'python3 -c "import py_compile; py_compile.compile(r"{self.grade_file}.{self.file_ext}")"'
            self.run = f'python3 {self.grade_file}.{self.file_ext}'
            self.time_limit = [3, 2]
            self.memory_limit = [2, 32]
        elif language == 'Java':
            self.util_file = 'java'
            self.file_ext = 'java'
            self.compile = ''
            self.run = ''
            self.time_limit = [3, 2]
            self.memory_limit = [2, 32]
        else:
            pass