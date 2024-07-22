// pages/api/rabbitmq.js
import amqp from 'amqplib/callback_api';

let channel = null;

// RabbitMQ에 연결 및 채널 생성
const connectRabbitMQ = () => {
  if (channel) return;

  amqp.connect('amqp://localhost', (err, connection) => {
    if (err) {
      console.error('Connection error', err);
      return;
    }

    connection.createChannel((err, ch) => {
      if (err) {
        console.error('Channel creation error', err);
        return;
      }
      channel = ch;
      console.log('RabbitMQ channel created');
    });
  });
};

connectRabbitMQ();

export default function handler(req, res) {
  if (req.method === 'POST') {
    if (!channel) {
      res.status(500).json({ error: 'RabbitMQ channel is not available' });
      return;
    }

    const { message } = req.body;

    // 여기에 적절한 큐 이름을 설정하세요.
    const queue = 'my_queue';

    channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(message));
    
    res.status(200).json({ message: 'Message sent to RabbitMQ' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
