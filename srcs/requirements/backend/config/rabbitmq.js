const amqp = require('amqplib');
const { rabbitmq: config } = require('./config');

let connection;

async function rabbitConnect() {
  if (!connection) {
    try {
      const RABBITMQ_URL = `amqp://${config.user}:${config.password}@${config.host}`;
      connection = await amqp.connect(RABBITMQ_URL);
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      setTimeout(rabbitConnect, 3000);
    }
  }
  return connection;
}

module.exports = rabbitConnect;
