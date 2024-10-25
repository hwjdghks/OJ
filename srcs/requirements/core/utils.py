import os
import shutil
import json
from grade_info import grade_info
from GradeInfo import GradeInfo

def _set_grade_data(info: GradeInfo) -> None:
    os.makedirs(info.work_dir, exist_ok=True)
    shutil.copytree(info.grade_data, info.work_dir, dirs_exist_ok=True)


def _set_submit_file(info: GradeInfo) -> None:
    with open(info.source_file, 'w') as file:
        file.write(info.code_content)


def _set_server_file(info: GradeInfo) -> None:
    with open(info.server_file, 'w') as file:
        file.write(info.server_file_content)


def setup_grade_environment(info: GradeInfo):
    _set_grade_data(info)
    _set_submit_file(info)
    _set_server_file(info)

