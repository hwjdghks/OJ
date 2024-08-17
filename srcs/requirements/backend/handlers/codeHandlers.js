const mysqlConnect = require('../config/db');
const rabbitConnect = require('../config/rabbitmq');
const { rabbitmq: config } = require('../config/config');

async function submitCodeHandler(req, res) {
  const { id, language, code } = req.body;

  if (!id || !language || !code) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const query = `
    INSERT INTO code (problem_id, language, code, result)
    VALUES (?, ?, ?, 0)
  `;
  try {
    const pool = await mysqlConnect();
    const [result] = await pool.query(query, [id, language, code]);
    const submit_id = result.insertId;

    const rabbitMQConn = await rabbitConnect();
    const channel = await rabbitMQConn.createChannel();
    const queue = config.send_queue;
    await channel.assertQueue(queue, { durable: false });

    const problem_id = id;
    const time = 1;
    const memory = 1;
    const message = JSON.stringify({ problem_id, submit_id, language, code, time, memory });
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
  const query = 'SELECT * FROM code WHERE id = ?';
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
