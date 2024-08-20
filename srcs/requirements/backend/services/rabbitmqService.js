const rabbitConnect = require('../config/rabbitmq');
const mysqlConnect = require('../config/db');
const { rabbitmq: config } = require('../config/config');

async function startConsume() {
  const connection = await rabbitConnect();
  const pool = await mysqlConnect();
  const channel = await connection.createChannel();
  const queue = config.recv_queue;

  await channel.assertQueue(queue, { durable: false });

  channel.consume(queue, async (msg) => {
    console.log("UPDATE REQUEST RECEIVED");
    const response = JSON.parse(msg.content.toString());
    console.log(response);
    const { submit_id, result } = response;
    const sql = 'UPDATE code SET result = ? WHERE id = ?';
    await pool.query(sql, [result, submit_id]);
    channel.ack(msg);
  });
}

module.exports = startConsume;
