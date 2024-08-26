const mysqlConnect = require('../config/db');
const rabbitConnect = require('../config/rabbitmq');
const { rabbitmq: config } = require('../config/config');

async function submitCodeHandler(req, res) {
  const { id, language, code } = req.body;

  if (!id || !language || !code) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const insert_query = `
    INSERT INTO code (problem_id, language, code_content, submit_result)
    VALUES (?, ?, ?, 0)
  `;
  const code_query ='SELECT keyword, time_limit, memory_limit FROM problem WHERE problem_id = ?';
  try {
    const pool = await mysqlConnect();
    const [result] = await pool.query(insert_query, [id, language, code]);
    const submit_id = result.insertId;

    const rabbitMQConn = await rabbitConnect();
    const channel = await rabbitMQConn.createChannel();
    const queue = config.send_queue;
    await channel.assertQueue(queue, { durable: false });

    const [problemResults] = await pool.query(code_query, [id]);
    const { keyword, time_limit: time, memory_limit: memory } = problemResults[0];
    const message = JSON.stringify({ problem_id: id, submit_id, language, code, keyword, time, memory });
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
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: '제출 ID가 필요합니다.' });
  }
  const query = 'SELECT * FROM code WHERE code_id = ?';
  try {
    const pool = await mysqlConnect();
    const [results] = await pool.query(query, [id]);
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
