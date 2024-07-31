const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql2');

const port = 5000;

const connection = mysql.createConnection({
  host: 'mysql',
  user: 'user',
  password: 'password',
  database: 'OJ'
});

const connectWithRetry = () => {
  const retryInterval = 3000; // 재시도 간격 (밀리초 단위)
  let connection;

  while (!connection) {
    try {
      connection = mysql.createConnection({
        host: 'mysql',
        user: 'user',
        password: 'password',
        database: 'OJ'
      });
      connection.connect(err => {
        if (err) throw err;
        console.log('Connected to database.');
      });
    } catch (error) {
      console.error('Database connection failed:', error.stack);
      console.log(`Retrying database connection in ${retryInterval / 1000} seconds...`);
      const start = Date.now();
      while (Date.now() - start < retryInterval) {} // 재시도 대기
    }
  }
};
connectWithRetry();

app.use(cors()); // CORS 설정

app.get('/message', (req, res) => {
  console.log("요청 들어옴");

  // 미리 정의된 문자열
  const baseMessage = 'Hello from the backend!';
  
  // 랜덤 숫자 생성
  const randomNumber = Math.floor(Math.random() * 1000); // 0에서 999 사이의 랜덤 숫자 생성

  // 메시지에 랜덤 숫자 추가
  const messageWithNumber = `${baseMessage} ${randomNumber}`;

  // 응답 반환
  res.json({ message: messageWithNumber });
});

app.get('/problem', (req, res) => {
  // 단일 문제 정보 가져오기
  console.log(req.query);
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: '문제 ID가 필요합니다.' });
  }
  const query = 'SELECT * FROM problem WHERE id = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
    }
    console.log(results[0]);
    res.json(results[0]); // 결과 중 첫 번째 문제 반환
  });
});

app.get('/problem-set', (req, res) => {
  // 문제 목록 가져오기
  const query = 'SELECT * FROM problem';
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results);
  });
});

app.get('/results', (req, res) => {
  // 채점 결과 가져오기
  const query = 'SELECT * FROM code';
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json(results);
  });
});

app.get('/code', (req, res) => {
  // 단일 문제 정보 가져오기
  console.log(req.query);
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: '제출 ID가 필요합니다.' });
  }
  const query = 'SELECT * FROM code WHERE id = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: '제출 결과를 찾을 수 없습니다.' });
    }
    console.log(results[0]);
    res.json(results[0]); // 결과 중 첫 번째 문제 반환
  });
});


// JSON 데이터 파싱
app.use(express.json());

// URL-encoded 데이터 파싱
app.use(express.urlencoded({ extended: true }));

app.post('/submit', (req, res) => {
  const { id, language, code } = req.body;

  // 입력 값 검증
  if (!id || !language || !code) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // SQL 쿼리문 작성
  const query = `
    INSERT INTO code (problem_id, language, code, result)
    VALUES (?, ?, ?, 0)
  `;

  // 데이터베이스에 데이터 삽입
  connection.query(query, [id, language, code], (err, results) => {
    if (err) {
      console.error('Error inserting data into MySQL:', err);
      return res.status(500).json({ error: 'Failed to submit code' });
    }

    // 성공적으로 저장되었음을 응답
    res.status(200).json({ message: 'Code submitted successfully!' });
  });
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
