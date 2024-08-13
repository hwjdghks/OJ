FROM debian:bullseye-slim

RUN apt-get update -y && \
    apt-get install -y gcc && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /tmp
COPY C.sh run.sh
RUN useradd -m score
USER score
