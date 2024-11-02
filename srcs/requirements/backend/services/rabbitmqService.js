const rabbitConnect = require('../config/rabbitmq');
const mysqlConnect = require('../config/db');
const { rabbitmq: config } = require('../config/config');
const EventEmitter = require('events');
const responseEmitter = new EventEmitter();

async function startConsume() {
  const connection = await rabbitConnect();
  const pool = await mysqlConnect();
  const channel = await connection.createChannel();
  const queue = config.recv_queue;

  await channel.assertQueue(queue, { durable: false });
  console.log("Consume start");

  channel.consume(queue, async (msg) => {
    console.log("Message received from RabbitMQ");
    const response = JSON.parse(msg.content.toString());
    console.log(response);

    const { operation, data, requestId } = response;
    if (operation === 'grade') {
      const { code_id, submit_result, ai_result } = data;
      const query = 'UPDATE code SET submit_result = ?, ai_result = ? WHERE code_id = ?';
      await pool.query(query, [submit_result, ai_result, code_id]);
    }
    else if (operation === 'response') {
      // 특정 요청에 대해 EventEmitter로 이벤트 방출
      console.log('recive from core:', data);
      responseEmitter.emit(requestId, data);
    }
    channel.ack(msg);
  });
}

module.exports = startConsume;

