const mysqlConnect = require('../config/db');

async function getResultsHandler(req, res) {
  const query = 'SELECT * FROM code';
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
  getResultsHandler
};
