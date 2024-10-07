const rabbitConnect = require('../config/rabbitmq');
const mysqlConnect = require('../config/db');
const { rabbitmq: config } = require('../config/config');

async function startConsume() {
  const connection = await rabbitConnect();
  const pool = await mysqlConnect();
  const channel = await connection.createChannel();
  const queue = config.recv_queue;

  await channel.assertQueue(queue, { durable: false });
  console.log("Consume start");
  channel.consume(queue, async (msg) => {
    console.log("UPDATE REQUEST RECEIVED");
    const response = JSON.parse(msg.content.toString());
    console.log(response);
    const { code_id, submit_result, ai_result } = response;
    const query = 'UPDATE code SET submit_result = ?, ai_result = ? WHERE code_id = ?';
    await pool.query(query, [submit_result, ai_result, code_id]);
    channel.ack(msg);
  });
}

module.exports = startConsume;

