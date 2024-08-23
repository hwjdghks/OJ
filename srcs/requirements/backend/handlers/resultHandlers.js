const mysqlConnect = require('../config/db');

async function getResultsHandler(req, res) {
  // 쿼리 파라미터에서 page와 limit 추출, 기본값 설정
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  // 오프셋 계산
  const offset = (page - 1) * limit;

  // 최신 항목이 먼저 나오도록 정렬
  const query = 'SELECT * FROM code ORDER BY code_id DESC LIMIT ? OFFSET ?';

  try {
    const pool = await mysqlConnect();
    const [results] = await pool.query(query, [limit, offset]);

    // 전체 결과 수를 가져오기 위한 쿼리 (선택 사항)
    const totalQuery = 'SELECT COUNT(*) AS totalResults FROM code';
    const [[{ totalResults }]] = await pool.query(totalQuery);

    res.json({
      results,
      totalResults
    });
  } catch (err) {
    console.error('데이터베이스 쿼리 오류:', err);
    res.status(500).json({ error: '데이터베이스 쿼리 오류' });
  }
}

module.exports = {
  getResultsHandler
};
