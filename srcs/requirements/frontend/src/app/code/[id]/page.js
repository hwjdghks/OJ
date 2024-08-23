'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CodePage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProblem = async () => {
      try {
        const response = await fetch(`/api/code/${id}`);
        if (!response.ok) {
          throw new Error('문제를 가져오는 데 실패했습니다.');
        }
        const data = await response.json();
        setProblem(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  if (loading) return <p style={styles.loading}>로딩 중...</p>;
  if (error) return <p style={styles.error}>문제를 가져오는 데 실패했습니다: {error.message}</p>;

  return (
    <div style={styles.container}>
      {problem ? (
        <div style={styles.content}>
          <h1 style={styles.heading}>{problem.language}</h1>
          <pre style={styles.code}>{problem.code_content}</pre>
        </div>
      ) : (
        <p style={styles.noProblem}>문제를 찾을 수 없습니다.</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
  },
  content: {
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    padding: '20px',
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  code: {
    backgroundColor: '#f5f5f5',
    padding: '10px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    fontSize: '1rem',
  },
  loading: {
    fontSize: '1rem',
    color: '#0056b3',
  },
  error: {
    fontSize: '1rem',
    color: '#dc3545', // Bootstrap's danger color for error
  },
  noProblem: {
    fontSize: '1rem',
    color: '#6c757d', // Bootstrap's secondary color for "not found"
  },
};
