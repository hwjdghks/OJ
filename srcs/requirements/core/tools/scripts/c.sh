#!/bin/bash

gcc -o Main Main.c
if [ $? -ne 0 ]; then
    exit 40 # runtime error
fi
# 'in' 폴더 내부의 파일 개수 계산
file_count=$(ls ./in | wc -l)

# 파일 쌍 반복 비교
for i in $(seq 1 $file_count); do
    # 프로그램 실행
    user=$(./Main < ./in/$i.in)
    if [ $? -ne 0 ]; then
        exit 40 # runtime error
    fi
    # 출력 비교
    answer=$(cat ./out/$i.out)
    diff <(echo "$user") <(echo "$answer") > /dev/null
    if [ $? -ne 0 ]; then
        exit 20 # wrong answer
    fi
done
exit 0 # correct