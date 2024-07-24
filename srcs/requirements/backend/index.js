const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

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
  const query = 'SELECT * FROM problem WHERE id = ?';
});

app.get('/problem-set', (req, res) => {
  // 문제 목록 가져오기
  const query = 'SELECT * FROM problem';
});

app.get('/results', (req, res) => {
  // 채점 결과 가져오기
  const query = '';
});

app.post('/submit', (req, res) => {
  // 제출된 코드 저장하기
  const query = '';
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
