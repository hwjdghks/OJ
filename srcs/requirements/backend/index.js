import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import amqp from 'amqplib';
import dotenv from 'dotenv';

const app = express();
dotenv.config();
const port = 5000;

let mysqlConn;
const mysqlConntWithRetry = async () => {
  const retryInterval = 15000; // 재시도 간격 (밀리초 단위)
  while (!mysqlConn) {
    try {
      await new Promise(resolve => setTimeout(resolve, retryInterval));
      mysqlConn = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
      });
    } catch (error) {
      console.error('Database connection failed:', error.stack);
      console.log(`Retrying database connection in ${retryInterval / 1000} seconds...`);
    }
  }
  console.log('Connected to database.');
};
mysqlConntWithRetry();

let rabbitMQConn;
const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}`;

const rabbitMQConntWithRetry = async () => {
  const retryInterval = 15000; // 재시도 간격 (밀리초 단위)
  while (!rabbitMQConn) {
    try {
      await new Promise(resolve => setTimeout(resolve, retryInterval));
      rabbitMQConn = await amqp.connect(RABBITMQ_URL);
      console.log('Connected to RabbitMQ.');

      process.once('SIGINT', async () => {
        if (rabbitMQConn) {
          await rabbitMQConn.close();
          console.log('RabbitMQ connection closed.');
        }
        process.exit(0); // 정상 종료를 위해 exit 호출
      });

      // 초기화가 완료된 후에 채널 생성
      const mainChannel = await rabbitMQConn.createChannel();
      const mainQueue = 'message';
      await mainChannel.assertQueue(mainQueue, { durable: false });

      mainChannel.consume(mainQueue, async (msg) => {
        console.log("UPDATE REQUEST RECEIVED");
        const id = JSON.parse(msg.content.toString());
        console.log("id = " + id);
        const sql = 'UPDATE code SET result = ? WHERE id = ?';
        await mysqlConn.query(sql, [100 + id, 2]);
      });

    } catch (error) {
      console.error('RabbitMQ connection error:', error);
      console.log(`Retrying RabbitMQ connection in ${retryInterval / 1000} seconds...`);
    }
  }
  console.log('Connected to Message Queue.');
};
rabbitMQConntWithRetry();

app.use(cors({
  origin: 'http://frontend:3000/api' // 필요한 도메인만 허용
}));

app.get('/problem', async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: '문제 ID가 필요합니다.' });
  }
  const query = 'SELECT * FROM problem WHERE id = ?';
  try {
    const [results] = await mysqlConn.query(query, [id]);
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
    const query = 'SELECT * FROM problem';
    const [results] = await mysqlConn.query(query);
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
    const [results] = await mysqlConn.query(query);
    res.json(results);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
});

app.get('/code', async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: '제출 ID가 필요합니다.' });
  }
  const query = 'SELECT * FROM code WHERE id = ?';
  try {
    const [results] = await mysqlConn.query(query, [id]);
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
    const [result] = await mysqlConn.query(query, [id, language, code]);
    const submit_id = result.insertId;

    const channel = await rabbitMQConn.createChannel();
    const queue = 'my_queue';
    await channel.assertQueue(queue, { durable: false });
    const message = JSON.stringify({ id, submit_id, language, code });
    console.log(message)
    await channel.sendToQueue(queue, Buffer.from(message));

    channel.close();

    res.status(200).json({ message: 'Code submitted successfully!' });
  } catch (err) {
    console.error('Error inserting data into MySQL:', err);
    res.status(500).json({ error: 'Failed to submit code' });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
