-- 유저 생성 및 권한 부여
CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON OJ.* TO 'user'@'%';

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS OJ;

-- 데이터베이스 사용
USE OJ;   

-- problem 테이블 생성
CREATE TABLE problem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT
);

-- code 테이블 생성
CREATE TABLE code (
    id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT,
    language VARCHAR(50),
    code TEXT NOT NULL,
    result INT,
    FOREIGN KEY (problem_id) REFERENCES problem(id)
);

CREATE TABLE users (
    id VARCHAR(50),
    password VARCHAR(255),
    email VARCHAR(100)
);

-- problem 테이블에 샘플 데이터 삽입
INSERT INTO problem (title, description) VALUES
('Two Sum', 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.');
INSERT INTO problem (title, description) VALUES
('Two Sum', 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.');
INSERT INTO problem (title, description) VALUES
('Two Sum', 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.');


-- code 테이블에 샘플 데이터 삽입
INSERT INTO code (problem_id, language, code, result) VALUES
(1, 'Python', 'def two_sum(nums, target):\n    num_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_map:\n            return [num_map[complement], i]\n        num_map[num] = i\n    return []', 0);
