import os
import shutil
import json
from grade_info import grade_info

def _get_grade_info(stream: bytes) -> grade_info:
    return grade_info(json.loads(stream))


def _get_grade_dir_path(submit_id) -> str:
    return f'/app/{submit_id}'


def _get_origin_data_path(problem_id) -> str:
    return f'tools/data/{problem_id}'


def _set_grade_data(src_path: str, dst_path: str) -> None:
    os.makedirs(dst_path, exist_ok=True)
    shutil.copytree(src_path, dst_path, dirs_exist_ok=True)


def _set_submit_file(file_path: str, src: str) -> None:
    with open(file_path, 'w') as file:
        file.write(src)


def _set_server_file(file_path: str, info: grade_info) -> None:
    grade_server_dockefile = f'''
FROM {info.util_file}:base
ENV TIMEOUT={info.time * info.time_limit[0] + info.time_limit[1]}
ENV MEMOUT={1024 * (info.memory * info.memory_limit[0] + info.memory_limit[1])}
COPY . .
ENTRYPOINT ["bash", "run.sh"]
'''
    with open(file_path, 'w') as file:
        file.write(grade_server_dockefile)


def setup_grade_environment(stream: bytes):
    info = _get_grade_info(stream)
    dir_path = _get_grade_dir_path(info.submit_id)
    data_path = _get_origin_data_path(info.problem_id)
    _set_grade_data(data_path, dir_path)

    submit_file_path = f'{dir_path}/{info.grade_file}.{info.file_ext}'
    server_file_path = f'{dir_path}/Dockerfile'
    _set_submit_file(submit_file_path, info.source)
    _set_server_file(server_file_path, info)
    return dir_path, info


def set_response(info: grade_info, major_result: int):
    _dict_response = {
        'code_id': info.submit_id,
        'submit_result': major_result,
        'ai_sresult': 'check' if 'ai_res' in locals() else 'no values'
    }
    return json.dumps(_dict_response)
