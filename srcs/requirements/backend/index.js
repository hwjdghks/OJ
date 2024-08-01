const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql2/promise');
const amqp = require('amqplib/callback_api');

const port = 5000;
const RABBITMQ_URL = 'amqp://rabbitmq';

let connection;

const connectWithRetry = async () => {
  const retryInterval = 3000; // 재시도 간격 (밀리초 단위)
  while (!connection) {
    try {
      await new Promise(resolve => setTimeout(resolve, retryInterval));
      connection = await mysql.createConnection({
        host: 'mysql',
        user: 'user',
        password: 'password',
        database: 'OJ'
      });
      console.log('Connected to database.');
    } catch (error) {
      console.error('Database connection failed:', error.stack);
      console.log(`Retrying database connection in ${retryInterval / 1000} seconds...`);
    }
  }
};
connectWithRetry();

// app.use(cors());
app.use(cors({
  origin: 'http://frontend:3000/api' // 필요한 도메인만 허용
}));

app.get('/problem', async (req, res) => {
  // 단일 문제 정보 가져오기
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: '문제 ID가 필요합니다.' });
  }
  const query = 'SELECT * FROM problem WHERE id = ?';
  try {
    // 단일 문제
    const [results] = await connection.query(query, [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
});

app.get('/problem-set', async (req, res) => {
  try {
    // 문제 목록 가져오기
    const query = 'SELECT * FROM problem';
    const [results] = await connection.query(query);
    res.json(results);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
});

app.get('/results', async (req, res) => {
  // 채점 결과 가져오기
  const query = 'SELECT * FROM code';
  try {
    // 문제 목록 가져오기
    const [results] = await connection.query(query);
    res.json(results);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
});

app.get('/code', async (req, res) => {
  // 단일 문제 정보 가져오기
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: '제출 ID가 필요합니다.' });
  }
  const query = 'SELECT * FROM code WHERE id = ?';
  try {
    // 문제 목록 가져오기
    const [results] = await connection.query(query, [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: '제출 결과를 찾을 수 없습니다.' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
});


// JSON 데이터 파싱
app.use(express.json());

// URL-encoded 데이터 파싱
app.use(express.urlencoded({ extended: true }));

app.post('/submit', async (req, res) => {
  const { id, language, code } = req.body;

  if (!id || !language || !code) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const query = `
    INSERT INTO code (problem_id, language, code, result)
    VALUES (?, ?, ?, 0)
  `;
  try {
    await connection.query(query, [id, language, code]);
    res.status(200).json({ message: 'Code submitted successfully!' });
  } catch (err) {
    console.error('Error inserting data into MySQL:', err);
    res.status(500).json({ error: 'Failed to submit code' });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
