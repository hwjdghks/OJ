const mysqlConnect = require('../config/db');

async function getProblemHandler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: '문제 ID가 필요합니다.' });
  }
  const query = 'SELECT * FROM problem WHERE problem_id = ?';
  try {
    const pool = await mysqlConnect();
    const [results] = await pool.query(query, [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: '문제를 찾을 수 없습니다.' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
}

async function getProblemSetHandler(req, res) {
  const query = 'SELECT * FROM problem';
  try {
    const pool = await mysqlConnect();
    const [results] = await pool.query(query);
    res.json(results);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
}

module.exports = {
  getProblemHandler,
  getProblemSetHandler
};
