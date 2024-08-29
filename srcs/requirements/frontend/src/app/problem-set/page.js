'use client';

import Link from 'next/link';
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
          const errorData = await response.json(); // 서버의 에러 메시지를 받아옵니다.
          throw new Error(errorData.message || '제출한 문제 목록을 가져오는 데 실패했습니다.');
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

  if (loading) return <p style={styles.loading}>로딩 중...</p>;
  if (error) return <p style={styles.error}>문제 목록을 가져오는 데 실패했습니다: {error}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>문제 목록</h2>
      {problems.length === 0 ? (
        <p style={styles.noProblems}>등록된 문제가 없습니다.</p>
      ) : (
        <div style={styles.scrollContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={{ ...styles.tableCell, ...styles.tableHeaderCellId }}>ID</th>
                <th style={styles.tableCell}>제목</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr key={problem.problem_id} style={styles.tableRow}>
                  <td style={{ ...styles.tableCell, ...styles.tableCellId, ...styles.tableCellSeparator }}>
                    {problem.problem_id}
                  </td>
                  <td style={{ ...styles.tableCell, ...styles.tableCellTitle }}>
                    <Link href={`/problem/${problem.problem_id}`} style={styles.link}>
                      {problem.title}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    tableLayout: 'fixed',
  },
  tableHeader: {
    backgroundColor: '#f4f4f4',
    fontWeight: 'bold',
    borderBottom: '2px solid #ddd',
  },
  tableHeaderCellId: {
    textAlign: 'center',
    width: '10%', // Width for the ID column
  },
  tableCell: {
    border: '1px solid #ddd',
    padding: '8px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  tableCellId: {
    textAlign: 'right',
  },
  tableCellTitle: {
    textAlign: 'center',
  },
  tableCellSeparator: {
    borderRight: '1px solid #ddd',
  },
  tableRow: {
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    overflowX: 'auto',
  },
  loading: {
    fontSize: '1rem',
    color: '#007bff',
  },
  error: {
    fontSize: '1rem',
    color: '#dc3545',
  },
  noProblems: {
    fontSize: '1rem',
    color: '#333',
  },
  link: {
    textDecoration: 'none',
    color: '#0056b3', // Slightly muted blue
    fontWeight: 'bold',
  },
};
