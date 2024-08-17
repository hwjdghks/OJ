// config/config.js
require('dotenv').config();

module.exports = {
  mysql: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 10,
  },
  rabbitmq: {
    host: process.env.RABBITMQ_HOST,
    user: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
    recv_queue: 'message',
    send_queue: 'my_queue',
  },
  server: {
    port: process.env.PORT || 5000,
  },
};
