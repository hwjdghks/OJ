const mysqlConnect = require('../config/db');

async function addUserHandler(req, res) {
  try {
    const { user_email } = req.body;
    if (!user_email) {
      return res.status(400).json({ message: '이메일이 필요합니다.' });
    }
    const pool = await mysqlConnect();

    // Extract the ID part from the email (before '@')
    const userIdBase = user_email.split('@')[0];
    // Check if the user ID already exists
    let user_id = userIdBase;
    let userExists = true;
    let suffix = 1;
    while (userExists) {
      const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE user_id = ?', [user_id]);
      if (rows[0].count === 0) {
        userExists = false;
      } else {
        user_id = `${userIdBase}${suffix}`;
        suffix++;
      }
    }

    // Insert the new user
    await pool.query('INSERT INTO users (user_email, user_id) VALUES (?, ?)', [user_email, user_id]);

    res.status(201).json({ message: '사용자를 성공적으로 추가했습니다.', user_id });
  } catch (error) {
    console.error('사용자 추가 오류:', error);
    res.status(500).json({ message: '서버 내부 오류' });
  }
}

async function getUserHandler(req, res) {
  try {
    const { user_email } = req.params;
    if (!user_email) {
      return res.status(400).json({ message: '이메일이 필요합니다.' });
    }
    // 이메일을 기반으로 사용자 조회
    const pool = await mysqlConnect();
    const [rows] = await pool.query('SELECT user_id FROM users WHERE user_email = ?', [user_email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 사용자 ID 반환
    const user_id = rows[0].user_id;
    res.status(200).json({ user_id });
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({ message: '서버 내부 오류' });
  }
}
module.exports = {
    addUserHandler,
    getUserHandler
  };