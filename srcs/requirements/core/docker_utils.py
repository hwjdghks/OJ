import docker
import os
import shutil
from grade_info import grade_info
from config import language_config as config

# error
import requests
import docker.errors
from docker.models.images import Image
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


def _build_grade_image(path: str, tag: str) -> Image | None:
    print('{0} grade image build start.'.format(tag))
    try:
        client = docker.from_env()
        image, _ = client.images.build(
            path=path,
            tag=tag,
            rm=True
        )
        print(type(image))
        client.close()
    except docker.errors.BuildError as e:
        print('Docker build Error in build_grade_image():', e)
    except docker.errors.APIError as e:
        print('Docker API Error in build_grade_image():', e)
    except TypeError as e:
        print('Type Error in build_grade_image(). Check path or fileobj.')
        print('Error log:', e)
    except Exception as e:
        print('Unknown Exception in run_grade_server():', e)
    finally:
        if client:
            client.close()
        return image if image else None


def _run_grade_server(image: Image, container_name: str) -> Container | None:
    try:
        client = docker.from_env()
        container = client.containers.run(
            image=image.id,
            name=container_name,
            detach=True,
            security_opt=["no-new-privileges"],
            # read_only=True,
            user='grade',
            init=True,
            network_disabled=True,
        )
        print(type(container))
        print(f'컨테이너 시작됨: {container.id}')
    except docker.errors.ImageNotFound as e: # error in manual when timeout occurs
        print('Docker container timeout error in run_grade_server():', e)
    except docker.errors.APIError as e:
        print('Docker container API error in run_grade_server():', e)
    except Exception as e:
        print('Unknown Exception in run_grade_server():', e)
    finally:
        client.close()
        return container if container else None


def _process_container(container: Container):
    try:
        exit_code = container.wait()
        print(exit_code)
        exit_code = exit_code['StatusCode']
        logs = container.logs(stdout=True, stderr=True)
        print(f'컨테이너 로그: {logs.decode("utf-8")}')

        print(f'컨테이너 종료 코드: {exit_code}')
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
        return exit_code


def _clean_container(container: Container, image: Image, dir_path: str):
    container.stop()
    container.remove()
    client = docker.from_env()
    client.images.remove(image=image.id)
    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)
    client.close()


def init_base_images() -> None:
    build_path = './tools'
    docker_file_path = 'Dockerfiles'
    for key in config:
        _build_base_image(build_path, docker_file_path, config[key]['file_name'])
    print('Base images build complete.\n')


def major_grade_process(dir_path: str, info: grade_info):
    tag = f'{info.submit_id}:{info.util_file}'
    name = f'grade-{info.submit_id}'
    image = _build_grade_image(dir_path, tag)
    container = _run_grade_server(image, name)
    result = _process_container(container)
    _clean_container(container)
    return result