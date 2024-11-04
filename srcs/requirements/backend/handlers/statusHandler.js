const mysqlConnect = require('../config/db');
const { encrypt } = require('../utils/crypto');

async function getStatusHandler(req, res) {
  const { user_id } = req.params; // URL 파라미터에서 userId를 가져옴

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const query = `
    SELECT 
      c.code_id,
      c.language,
      p.title
    FROM code c
    JOIN problem p ON c.problem_id = p.problem_id
    WHERE c.user_id = ?
    ORDER BY c.code_id DESC
  `;

  try {
    const pool = await mysqlConnect();
    const [results] = await pool.query(query, [encrypt(user_id)]);
    console.log('불러오기 결과:', results);
    // user_id가 암호화되어 있는 경우를 위한 복호화 처리
    const decryptedResults = results.map(result => ({
      code_id: result.code_id,
      language: result.language,
      title: result.title
    }));
    console.log('변환 결과:', decryptedResults);
    res.status(200).json({
      results: decryptedResults
    });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query error' });
  }
}

module.exports = {
  getStatusHandler
};