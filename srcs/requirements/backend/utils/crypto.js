const crypto = require('crypto');

// 환경변수에서 비밀 키와 IV 가져오기 (base64 형식)
const secretKey = process.env.SECRET_KEY; // base64 인코딩된 32바이트 키
const iv = process.env.IV; // base64 인코딩된 16바이트 IV

if (!secretKey || !iv) {
  throw new Error('SECRET_KEY and IV must be set in environment variables');
}

// 암호화 함수
function encrypt(text) {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(secretKey, 'base64'),  // base64 형식을 Buffer로 변환
    Buffer.from(iv, 'base64')
  );
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

// 복호화 함수
function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(secretKey, 'base64'),
    Buffer.from(iv, 'base64')
  );
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 암복호화 모듈 내보내기
module.exports = {
  encrypt,
  decrypt,
};
