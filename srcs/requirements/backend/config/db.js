const mysql = require('mysql2/promise');
const { mysql: config } = require('./config');

let pool;

async function mysqlConnect() {
  if (!pool) {
    try {
      pool = await mysql.createPool({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        enableKeepAlive: true,
        waitForConnections: true,
        connectionLimit: config.connectionLimit,
        queueLimit: 0,
      });
      console.log('Connected to MySQL');
    } catch (error) {
      console.error('Failed to connect to MySQL:', error);
      setTimeout(mysqlConnect, 3000);
    }
  }
  return pool;
}

module.exports = mysqlConnect;