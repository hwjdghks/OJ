const mysqlConnect = require('../config/db');
const { encrypt, decrypt } = require('../utils/crypto');

// 사용자 추가 핸들러
async function addUserHandler(req, res) {
  try {
    const { user_email } = req.body;
    if (!user_email) {
      return res.status(400).json({ message: '이메일이 필요합니다.' });
    }
    const pool = await mysqlConnect();

    // 이메일을 암호화
    const encryptedEmail = encrypt(user_email);

    // 이메일에서 '@' 앞부분 추출 및 ID 생성
    const userIdBase = user_email.split('@')[0];
    let user_id = userIdBase;
    let userExists = true;
    let suffix = 1;

    // 사용자 ID 중복 확인
    while (userExists) {
      const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE user_id = ?', [encrypt(user_id)]);
      if (rows[0].count === 0) {
        userExists = false;
      } else {
        user_id = `${userIdBase}${suffix}`;
        suffix++;
      }
    }

    // 사용자 ID를 암호화하여 삽입
    const encryptedUserId = encrypt(user_id);

    // 트랜잭션을 통해 여러 쿼리 실행의 무결성 보장 (추가된 부분)
    await pool.query('START TRANSACTION');
    await pool.query('INSERT INTO users (user_email, user_id) VALUES (?, ?)', [encryptedEmail, encryptedUserId]);
    const [rows] = await pool.query('SELECT user_id, is_admin FROM users WHERE user_email = ?', [encryptedEmail]);
    await pool.query('COMMIT');
    res.status(201).json({ message: '사용자를 성공적으로 추가했습니다.', user_id: decrypt(rows[0].user_id), is_admin: Boolean(rows[0].is_admin) });
  } catch (error) {
    console.error('사용자 추가 오류:', error);

    // 트랜잭션 오류 시 롤백 추가 (추가된 부분)
    await pool.query('ROLLBACK');
    res.status(500).json({ message: '서버 내부 오류' });
  }
}

// 사용자 조회 핸들러
async function getUserHandler(req, res) {
  try {
    const { user_email } = req.params;

    // 입력값 검증
    if (!user_email) {
      return res.status(400).json({ message: '이메일이 필요합니다.' });
    }

    // 이메일 형식 검증 (추가된 부분)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
      return res.status(400).json({ message: '유효한 이메일 형식이 아닙니다.' });
    }

    const pool = await mysqlConnect();

    // 이메일을 암호화하여 조회
    const encryptedEmail = encrypt(user_email);
    const [rows] = await pool.query('SELECT user_id, is_admin FROM users WHERE user_email = ?', [encryptedEmail]);

    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 사용자 ID 복호화 후 반환
    const decryptedUserId = decrypt(rows[0].user_id);
    res.status(200).json({ user_id: decryptedUserId, is_admin: Boolean(rows[0].is_admin) });
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({ message: '서버 내부 오류' });
  }
}

module.exports = {
  addUserHandler,
  getUserHandler
};
