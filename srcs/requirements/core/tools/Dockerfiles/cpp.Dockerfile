# 채점 기반 OS 지정
FROM debian:bullseye-slim
# 채점 환경 세팅
RUN apt-get update -y && \
    apt-get install -y g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
# 작업 디렉터리 지정
WORKDIR /tmp
# 채점 스크립트 복사
COPY scripts/c.sh run.sh
# non-root 유저 추가
RUN useradd -m score
# 계정 변경
USER score
