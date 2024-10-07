const mysqlConnect = require('../config/db');
const rabbitConnect = require('../config/rabbitmq');
const { rabbitmq: config } = require('../config/config');
const { encrypt, decrypt } = require('../utils/crypto');

async function submitCodeHandler(req, res) {
  const { problem_id, language, code_content, user_id } = req.body;

  if (!problem_id || !language || !code_content) {
    return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
  }
  // 기본 쿼리와 추가할 쿼리
  let insert_query = `INSERT INTO code (problem_id, language, code_content, submit_result`;
  let insert_values = [problem_id, language, code_content];

  if (user_id) {
    insert_query += `, user_id) VALUES (?, ?, ?, 0, ?);`;
    insert_values.push(encrypt(user_id));
  } else {
    insert_query += `) VALUES (?, ?, ?, 0);`;
  }

  const code_query = 'SELECT keyword, time_limit, memory_limit FROM problem WHERE problem_id = ?';

  const pool = await mysqlConnect();
  const rabbitMQConn = await rabbitConnect();

  try {
    await pool.query('START TRANSACTION'); // 트랜잭션 시작

    // 코드 제출 정보 삽입
    const [result] = await pool.query(insert_query, insert_values);
    const submit_id = result.insertId;

    // 큐 생성 부분 별도로 실행 필요
    const channel = await rabbitMQConn.createChannel(); // RabbitMQ 채널 생성
    const queue = config.send_queue;
    await channel.assertQueue(queue, { durable: false });

    const [problemResults] = await pool.query(code_query, [problem_id]);
    if (problemResults.length === 0) {
      throw new Error('문제를 찾을 수 없습니다.'); // 문제 데이터가 없을 경우 처리
    }
    const { keyword, time_limit, memory_limit } = problemResults[0];
    const message = JSON.stringify({ problem_id, submit_id, language, code_content, keyword, time_limit, memory_limit });
    console.log(message);
    await channel.sendToQueue(queue, Buffer.from(message));
    channel.close();

    await pool.query('COMMIT'); // 트랜잭션 커밋

    res.status(200).json({ message: '코드가 성공적으로 제출되었습니다!' });
  } catch (err) {
    console.error('MySQL에 데이터 삽입 중 오류 발생:', err);
    await pool.query('ROLLBACK'); // 오류 발생 시 트랜잭션 롤백
    res.status(500).json({ error: '코드 제출에 실패했습니다.' });
  } finally {
    await rabbitMQConn.close(); // RabbitMQ 연결 종료
  }
}

async function getCodeHandler(req, res) {
  const { code_id } = req.params;
  if (!code_id) {
    return res.status(400).json({ error: '제출 ID가 필요합니다.' });
  }
  const query = 'SELECT * FROM code WHERE code_id = ?';
  try {
    const pool = await mysqlConnect();
    const [results] = await pool.query(query, [code_id]);
    if (results.length === 0) {
      return res.status(404).json({ error: '제출 결과를 찾을 수 없습니다.' });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    console.error('데이터베이스 쿼리 오류:', err);
    res.status(500).json({ error: '데이터베이스 쿼리 오류' });
  }
}

module.exports = {
  submitCodeHandler,
  getCodeHandler
};
