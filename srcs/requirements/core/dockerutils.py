import docker
import os
import shutil
from config import LANGUAGE_CONFIG
from GradeInfo import GradeInfo

# error
import requests
import docker.errors
from docker.models.containers import Container


def _build_base_image(build_path: str, dockerfile_path: str, language: str) -> None:
    tag = f'{language}:base'
    dockerfile = f'{dockerfile_path}/{language}.Dockerfile'
    print('{0:s} build start. file path: {1:s}'.format(tag, dockerfile))
    try:
        client = docker.from_env()
        image, logs = client.images.build(
            path=build_path, # 빌드 컨텍스트 경로 설정
            dockerfile=dockerfile, # 빌드할 도커 파일 설정
            tag=tag, # 이미지 태그 설정
            rm=True # 임시 컨테이너 삭제
        )
        print('Image ID  :', image.id)
        print('Image tags:', image.tags, '\n')
    except docker.errors.BuildError as e:
        print(f'Docker build Error in {language}:base :', e)
    except docker.errors.APIError as e:
        print(f'Docker API Error in {language}:base :', e)
    except TypeError as e:
        print(f'Type Error in {language}:base. Check path or fileobj.')
        print('Error log:', e)
    except Exception as e:
        print(f'Unknown Exception in {language}:base :', e)
    finally:
        if client:
            client.close()


def _build_grade_image(info: GradeInfo):
    print(f'[{info.tag_name}] grade image build start.')
    try:
        client = info.client
        info.image, _ = client.images.build(
            path=info.work_dir,
            tag=info.tag_name,
            rm=True
        )
    except docker.errors.BuildError as e:
        print('Docker build Error in build_grade_image():', e)
    except docker.errors.APIError as e:
        print('Docker API Error in build_grade_image():', e)
    except TypeError as e:
        print('Type Error in build_grade_image(). Check path or fileobj.')
        print('filename:', info.server_file, '\n', 'tagname:', info.tag_name)
        print('Error log:', e)
    except Exception as e:
        print('Unknown Exception in run_grade_server():', e)


def _run_grade_server(info: GradeInfo):
    print(f'{info.image.tags} container run start.')
    try:
        client = info.client
        info.container = client.containers.run(
            image=info.image.id,
            name=info.server_name,
            detach=True,
            security_opt=["no-new-privileges"],
            # read_only=True,
            user='grade',
            init=True,
            network_disabled=True,
        )
        print(f'{info.image.tags} Container ID: {info.container.id}')
    except docker.errors.ImageNotFound as e: # error in manual when timeout occurs
        print('Docker container timeout error in run_grade_server():', e)
    except docker.errors.APIError as e:
        print('Docker container API error in run_grade_server():', e)
    except Exception as e:
        print('Unknown Exception in run_grade_server():', e)


def _process_container(container: Container) -> int:
    log = ''
    try:
        exit_code = container.wait()
        exit_code = exit_code['StatusCode']
        logs = container.logs(stdout=True, stderr=True)
        log = logs.decode("utf-8")
        print(f'{container.name} server logs: {logs.decode("utf-8")}')
        print(f'{container.name} server exit_code: {exit_code}')
    except requests.exceptions.ReadTimeout as e: # error in manual when timeout occurs
        print('Docker container timeout error in process_container():', e)
    except requests.exceptions.ConnectionError as e: # real error when timeout occurs
        print('Docker container connection error in process_container():', e)
    except docker.errors.APIError as e:
        print('Docker container API error in process_container():', e)
    except Exception as e:
        print('Unknown Exception in process_container():', e)
    finally:
        if 'exit_code' not in locals():
            exit_code = 50
        return exit_code, log


def _clean_container(info: GradeInfo):
    print(f'remove {info.container.name}')
    info.container.stop()
    info.container.remove()
    client = info.client
    print(f'remove {info.image.tags}')
    client.images.remove(image=info.image.id)
    print(f'remove {info.work_dir}')
    if os.path.exists(info.work_dir):
        shutil.rmtree(info.work_dir)


def init_base_images() -> None:
    build_path = './tools'
    docker_file_path = 'Dockerfiles'
    for key in LANGUAGE_CONFIG:
        config = LANGUAGE_CONFIG.get(key)
        _build_base_image(build_path, docker_file_path, config['file_name'])
    print('Base images build complete.\n')


def major_grade_process(info: GradeInfo):
    print(f'[{info.tag_name}] 채점 서버 환경 구성 시작')
    _build_grade_image(info)
    print(f'[{info.tag_name}] 채점 서버 실행')
    _run_grade_server(info)
    result, log = _process_container(info.container)
    print(f'[{info.tag_name}] 채점 환경 정리')
    _clean_container(info)
    return result, log
