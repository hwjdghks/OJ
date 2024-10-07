const mysqlConnect = require('../config/db');
const { decrypt } = require('../utils/crypto');

async function getResultsHandler(req, res) {
  // 쿼리 파라미터에서 page와 limit 추출, 기본값 설정
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  // 페이지와 제한 값 검증 (추가된 부분)
  if (page < 1 || limit < 1) {
    return res.status(400).json({ error: '페이지 번호와 제한 값은 1 이상의 값이어야 합니다.' });
  }

  // 오프셋 계산
  const offset = (page - 1) * limit;

  // 최신 항목이 먼저 나오도록 정렬
  const query = 'SELECT * FROM code ORDER BY code_id DESC LIMIT ? OFFSET ?';

  try {
    const pool = await mysqlConnect();
    const [results] = await pool.query(query, [limit, offset]); // need exception

    // user_id 복호화
    const decryptedResults = results.map(result => {
      return {
        ...result,
        user_id: decrypt(result.user_id) // user_id 복호화
      };
    });

    // 전체 결과 수를 가져오기 위한 쿼리 (선택 사항)
    const totalQuery = 'SELECT COUNT(*) AS totalResults FROM code';
    const [[{ totalResults }]] = await pool.query(totalQuery); // need exception

    res.status(200).json({
      results: decryptedResults, // 복호화된 결과를 응답에 포함
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
