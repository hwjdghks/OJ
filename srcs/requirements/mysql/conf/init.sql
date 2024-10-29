-- 업데이트 시 참조 코드
-- sed -n '15,$p' init.sql > update.sql
-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS npm;
CREATE DATABASE IF NOT EXISTS oj_db;

-- 사용자 생성 및 권한 부여
CREATE USER IF NOT EXISTS 'npm_user'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON npm.* TO 'npm_user'@'%';

CREATE USER IF NOT EXISTS 'oj_user'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON oj_db.* TO 'oj_user'@'%';

-- 권한 적용
FLUSH PRIVILEGES;

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
    grade_guide TEXT,
    memory_limit INT NOT NULL,  -- MB
    time_limit INT NOT NULL,     -- ms
    memory_balance BOOLEAN NOT NULL DEFAULT TRUE,
    time_balance BOOLEAN NOT NULL DEFAULT TRUE,
    is_basic_format BOOLEAN NOT NULL DEFAULT TRUE,
    is_delete_white_space BOOLEAN NOT NULL DEFAULT FALSE,
    is_delete_blank_line BOOLEAN NOT NULL DEFAULT FALSE
    -- allow_language TEXT NOT NULL DEFAULT 'ALL',
    -- is_partial_grade BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE example (
    example_id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT,
    input_example TEXT NOT NULL,
    output_example TEXT NOT NULL,
    FOREIGN KEY (problem_id) REFERENCES problem(problem_id)
);

CREATE TABLE users (
    user_email VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    is_admin BOOLEAN DEFAULT FALSE
);

-- code 테이블 생성
CREATE TABLE code (
    code_id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT,
    user_id VARCHAR(255),
    language VARCHAR(20),
    code_content TEXT NOT NULL,
    submit_result INT,
    ai_result VARCHAR(10),
    used_memory INT,
    used_time INT,
    error_log TEXT,
    FOREIGN KEY (problem_id) REFERENCES problem(problem_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- problem 테이블에 샘플 데이터 삽입
INSERT INTO problem (title, description, input, output, keyword, grade_guide, memory_limit, time_limit)
VALUES
    ('A+B', 
     '두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.', 
     '첫째 줄에 A와 B가 주어진다. (0 < A, B < 10)', 
     '첫째 줄에 A+B를 출력한다.', 
     '덧셈, 입출력',
     '1. 더하기 연산자 또는 그에 상응하는 기능을 사용했으면 통과',
     128, 1),

    ('별 찍기', 
     '첫째 줄에는 별 N개, 둘째 줄에는 별 N-1개, ..., N번째 줄에는 별 1개를 찍는 문제', 
     '첫째 줄에 N(1 ≤ N ≤ 100)이 주어진다.', 
     '첫째 줄부터 N번째 줄까지 차례대로 별을 출력한다.', 
     '반복문', 
     'If implemented with a loop, it will be marked as correct; if implemented with recursion, it will be marked as incorrect.',
     128, 1),

    ('제목', 
     '문제 설명', 
     '입력 설명', 
     '출력 설명', 
     '모든 출력 허용', 
     '채점 가이드를 입력하세요', 
     100, 10);

INSERT INTO example (problem_id, input_example, output_example)
VALUES
    (1, 
    '1 2', 
    '3'),

    (1, 
    '2 2', 
    '4'),

    (2, 
    '3', 
    '***\n**\n*');

-- code 테이블에 샘플 데이터 삽입
INSERT INTO code (problem_id, language, code_content, submit_result, error_log)
VALUES
    (1, 
    'Python', 
    'sql test', 
    0, 
    '');
