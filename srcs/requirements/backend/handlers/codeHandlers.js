const mysqlConnect = require('../config/db');
const rabbitConnect = require('../config/rabbitmq');
const { rabbitmq: config } = require('../config/config');

async function submitCodeHandler(req, res) {
  const { problem_id, language, code_content, user_id } = req.body;

  if (!problem_id || !language || !code) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // 기본 쿼리와 추가할 쿼리
  let insert_query = `INSERT INTO code (problem_id, language, code_content, submit_result`;
  let insert_values = [problem_id, language, code_content];

  if (user_id) {
    insert_query += `, user_id) VALUES (?, ?, ?, 0, ?);`;
    insert_values.push(user_id);
  } else {
    insert_query += `) VALUES (?, ?, ?, 0);`;
  }

  const code_query = 'SELECT keyword, time_limit, memory_limit FROM problem WHERE problem_id = ?';

  try { // need transaction
    const pool = await mysqlConnect();
    const [result] = await pool.query(insert_query, insert_values); // need exception
    const submit_id = result.insertId;

    const rabbitMQConn = await rabbitConnect(); // 큐 생성 부분 별도 실행 필요
    const channel = await rabbitMQConn.createChannel(); // need exception
    const queue = config.send_queue;
    await channel.assertQueue(queue, { durable: false }); // need exception

    const [problemResults] = await pool.query(code_query, [id]); // need exception
    const { keyword, time_limit, memory_limit } = problemResults[0];
    const message = JSON.stringify({ problem_id, submit_id, language, code_content, keyword, time_limit, memory_limit });
    console.log(message);
    await channel.sendToQueue(queue, Buffer.from(message));

    channel.close();

    res.status(200).json({ message: 'Code submitted successfully!' });
  } catch (err) {
    console.error('Error inserting data into MySQL:', err);
    res.status(500).json({ error: 'Failed to submit code' });
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
    res.json(results[0]);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
}

module.exports = {
  submitCodeHandler,
  getCodeHandler
};
