// app/problems/page.js
'use client'
import { useEffect, useState } from 'react';

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch problems data from the API
    async function fetchProblems() {
      try {
        const response = await fetch('/api/problem-set'); // Ensure this matches the endpoint provided in your route.js
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setProblems(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProblems();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={styles.container}>
      <h2>문제 목록</h2>
      {problems.length === 0 ? (
        <p>등록된 문제가 없습니다.</p>
      ) : (
        <ul style={styles.list}>
          {problems.map((problem) => (
            <li key={problem.id} style={styles.listItem}>
              <h3>{problem.title}</h3>
              <p>{problem.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
    container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    list: {
      listStyleType: 'none',
      padding: 0,
    },
    listItem: {
      marginBottom: '10px',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      backgroundColor: '#f9f9f9',
    },
  };