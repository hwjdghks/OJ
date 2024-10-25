from dataclasses import dataclass, field
from config import LANGUAGE_CONFIG
from docker.models.images import Image
from docker.models.containers import Container
import textwrap
import json
import docker

@dataclass
class GradeInfo:
    problem_id: str
    submit_id: str
    language: str
    code_content: str
    time_limit: int
    memory_limit: int
    grade_file: str = 'Main'
    description: str = ''
    keyword: str = ''
    grade_guide: str = ''
    client: docker.DockerClient = docker.from_env()
    image: Image = field(init=False, default_factory=Image)
    container: Container = field(init=False, default_factory=Container)
    response: dict = field(init=False, default_factory=dict)

    def __post_init__(self):
        self._get_language_config()
        self._set_env_strings()
        self._set_server_strings()
        self._set_server_file_content()

    def _get_language_config(self):
        config = LANGUAGE_CONFIG.get(self.language)
        if config:
            self.util_file = config['file_name']
            self.file_ext = config['file_ext']
            self.compile = config['compile_cmd']
            self.run = config['execute_cmd']
            self.time_factor = config['time_factor']
            self.memory_factor = config['memory_factor']
        else:
            raise ValueError(f"Unsupported language: {self.language}")

    def _set_env_strings(self):
        self.work_dir = f'/app/{self.submit_id}'
        self.grade_data = f'tools/data/{self.problem_id}'
        self.source_file = f'{self.work_dir}/{self.grade_file}.{self.file_ext}'
        self.server_file = f'{self.work_dir}/Dockerfile'

    def _set_server_file_content(self):
        timeout = self.time_limit * self.time_factor[0] + self.time_factor[1]
        memout = 1024 * (self.memory_limit * self.memory_factor[0] + self.memory_factor[1])
        self.server_file_content = textwrap.dedent(f'''\
            FROM {self.util_file}:base
            ENV TIMEOUT={timeout}
            ENV MEMOUT={memout}
            COPY . .
            ENTRYPOINT ["bash", "run.sh"]
        ''')

    def _set_server_strings(self):
        self.tag_name = f'{self.submit_id}:{self.util_file}'
        self.server_name = f'grade-{self.submit_id}'

    def set_response(self, standard_result, ai_result):
        _dict_response = {
            'code_id': self.submit_id,
            'submit_result': standard_result,
            'ai_sresult': ai_result
        }
        self.response = json.dumps(_dict_response)

    def close(self):
        self.client.close()