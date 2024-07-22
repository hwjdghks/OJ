'use client'
import { useState, useEffect } from 'react';

export default function Messages() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
  }, []);

  const fetchMessage = async () => {
    try {
      const res = await fetch(`http://backend:5000/message`);
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      else
      {
        console.log("성공");
      }
      const data = await res.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Failed to fetch message:', error);
    }
  };

  return (
    <div>
      <button onClick={fetchMessage}>Fetch Message</button>
      {message && <p>{message}</p>}
    </div>
  );
}
