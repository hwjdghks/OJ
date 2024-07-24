'use client'
// app/message/page.js
import { useState } from 'react';

export default function MessagePage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMessage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/message');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error fetching message:', error);
      setMessage('Failed to fetch message.');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Message Page</h1>
      <button onClick={fetchMessage} disabled={loading}>
        {loading ? 'Loading...' : 'Get Message'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
