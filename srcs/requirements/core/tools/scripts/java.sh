#!/bin/bash

javac -J-Xms1024m -J-Xmx1920m -J-Xss512m -encoding UTF-8 Main.java
if [ $? -ne 0 ]; then
    exit 30 # compile error
fi
# 'in' 폴더 내부의 파일 개수 계산
file_count=$(ls ./in | wc -l)

# ulimit -v $MEMOUT
# 파일 쌍 반복 비교
for i in $(seq 1 $file_count); do
    # 프로그램 실행
    user=$(timeout ${TIMEOUT}s java -Xms1024m -Xmx1920m -Xss512m -Dfile.encoding=UTF-8 Main < ./in/$i.in)
    exit_code=$?
    if [ $exit_code -ne 0 ]; then
        if [ $exit_code -eq 124 ]; then
            exit 50 # time limit exceeded
        else
            exit 40 # runtime error
        fi
    fi
    # 출력 비교
    answer=$(cat ./out/$i.out)
    diff <(echo "$user") <(echo "$answer") > /dev/null
    if [ $? -ne 0 ]; then
        exit 20 # wrong answer
    fi
done
exit 10 # correct