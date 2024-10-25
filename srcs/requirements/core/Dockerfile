# 베이스 이미지로 Python 3.9을 사용합니다.
FROM python:3.13-slim

# 작업 디렉토리 생성
WORKDIR /app

# 의존성 파일 복사
COPY ./conf/requirements.txt .

# 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt
RUN rm requirements.txt
RUN pip install --upgrade openai
# 애플리케이션 코드 복사
COPY core.py .
COPY callback.py .
COPY grade_info.py .
COPY main.py .
COPY config.py .
COPY worker.py .
COPY grade.py .
COPY utils.py .
COPY dockerutils.py .
COPY GradeInfo.py .
COPY tools tools

# 애플리케이션 실행
CMD ["python", "-u", "main.py"]
