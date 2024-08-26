-- 유저 생성 및 권한 부여
CREATE USER IF NOT EXISTS 'oj_user'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON oj_db.* TO 'oj_user'@'%';

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS oj_db;

-- 데이터베이스 사용
USE oj_db;

-- problem 테이블 생성
CREATE TABLE problem (
    problem_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    input TEXT,
    output TEXT,
    keyword TEXT,
    memory_limit INT NOT NULL,  -- MB
    time_limit INT NOT NULL     -- ms
);

CREATE TABLE example (
    example_id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT,
    input_example TEXT NOT NULL,
    output_example TEXT NOT NULL,
    FOREIGN KEY (problem_id) REFERENCES problem(problem_id)
);

-- code 테이블 생성
CREATE TABLE code (
    code_id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT,
    language VARCHAR(20),
    code_content TEXT NOT NULL,
    submit_result INT,
    ai_result VARCHAR(10),
    error_log TEXT,
    FOREIGN KEY (problem_id) REFERENCES problem(problem_id)
);

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_password VARCHAR(255) NOT NULL UNIQUE,
    user_email VARCHAR(255) NOT NULL
);

-- problem 테이블에 샘플 데이터 삽입
INSERT INTO problem (title, description, input, output, keyword, memory_limit, time_limit) VALUES
('A+B', '두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.', '첫째 줄에 A와 B가 주어진다. (0 < A, B < 10)', '첫째 줄에 A+B를 출력한다.', '덧셈, 출력', 128, 1),
('별 찍기', '첫째 줄에는 별 N개, 둘째 줄에는 별 N-1개, ..., N번째 줄에는 별 1개를 찍는 문제', '첫째 줄에 N(1 ≤ N ≤ 100)이 주어진다.', '첫째 줄부터 N번째 줄까지 차례대로 별을 출력한다.', '반복문', 128, 1),
('제목', '문제 설명', '입력 설명', '출력 설명', '모든 출력 허용', 100, 10);

INSERT INTO example (problem_id, input_example, output_example) VALUES
(1, '1 2', '3'),
(1, '2 2', '4'),
(2, '3', '***\n**\n*');

-- code 테이블에 샘플 데이터 삽입
INSERT INTO code (problem_id, language, code_content, submit_result, error_log) VALUES
(1, 'Python', 'def two_sum(nums, target):\n    num_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_map:\n            return [num_map[complement], i]\n        num_map[num] = i\n    return []', 0, '');
