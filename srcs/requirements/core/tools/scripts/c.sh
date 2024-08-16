#!/bin/bash

# 현재 디렉토리 출력
echo $(pwd)

# 'in' 폴더 내부의 파일 개수 계산
file_count=$(ls ./in | wc -l)

# 초기 점수 상태
overall_result=0

# 파일 쌍 반복 비교
for i in $(seq 1 $file_count); do
    diff <(./Main < ./in/$i.in) ./out/$i.out > /dev/null 2>&1
    result=$?
    
    # 에러가 발생하면 overall_result에 반영
    if [ $result -ne 0 ]; then
        overall_result=1
    fi
    
    echo "Score result for test $i: $result"
done

# 전체 결과 출력
if [ $overall_result -eq 0 ]; then
    echo "All tests passed successfully."
else
    echo "Some tests failed."
fi

exit $overall_result
