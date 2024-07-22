// components/SendButton.js
'use client'
import { useState } from 'react';

const SendButton = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);

  const handleSendMessage = async () => {
    const res = await fetch('./api/rabbitmq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    setResponse(data.message);
  };

  return (
    <div>
      <input 
        type="text" 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your message"
      />
      <button onClick={handleSendMessage}>Send</button>
      {response && <p>{response}</p>}
    </div>
  );
};

export default SendButton;
