'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProblemPage() {
  const router = useRouter();
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProblem = async () => {
      try {
        const response = await fetch(`/api/problem/${id}`);
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

  const handleSubmitClick = () => {
    if (id) {
      router.push(`/submit/${id}`);
    }
  };

  if (loading) return <p style={styles.loading}>로딩 중...</p>;
  if (error) return <p style={styles.error}>문제를 가져오는 데 실패했습니다: {error.message}</p>;

  return (
    <div style={styles.container}>
      {problem ? (
        <div style={styles.problemContainer}>
          <h1 style={styles.title}>{problem.title}</h1>
          <table style={styles.table}>
            <tbody>
              <tr style={styles.tableRow}>
                <th style={{ ...styles.tableCell, ...styles.tableHeaderCell }}>메모리 제한</th>
                <td style={styles.tableCell}>{problem.memory_limit} MB</td>
              </tr>
              <tr style={styles.tableRow}>
                <th style={{ ...styles.tableCell, ...styles.tableHeaderCell }}>시간 제한</th>
                <td style={styles.tableCell}>{problem.time_limit} 초</td>
              </tr>
            </tbody>
          </table>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>문제</h2>
            <p style={styles.description}>{problem.description}</p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>입력</h2>
            <pre style={styles.pre}>{problem.input}</pre>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>출력</h2>
            <pre style={styles.pre}>{problem.output}</pre>
          </div>

          <button
            onClick={handleSubmitClick}
            style={styles.button}
          >
            제출하기
          </button>
        </div>
      ) : (
        <p>문제를 찾을 수 없습니다.</p>
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
  problemContainer: {
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    padding: '20px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '600',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  tableRow: {
    borderBottom: '1px solid #ddd',
  },
  tableCell: {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
  },
  tableHeaderCell: {
    fontWeight: '700',
    backgroundColor: '#f4f4f4',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '8px',
  },
  description: {
    color: '#333',
    lineHeight: '1.6',
  },
  pre: {
    backgroundColor: '#f5f5f5',
    padding: '12px',
    borderRadius: '4px',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    fontSize: '1rem', // Default font size
  },
  button: {
    padding: '10px 20px', // Adjusted padding for a smaller button width
    backgroundColor: '#0056b3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: '10px',
    width: 'fit-content', // Adjust width to fit content
  },
  loading: {
    fontSize: '1rem',
    color: '#007bff',
  },
  error: {
    fontSize: '1rem',
    color: '#dc3545',
  },
};
