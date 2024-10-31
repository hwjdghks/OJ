'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProblemsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProblems() {
      try {
        const response = await fetch('/api/problem-set');
        if (!response.ok) {
          const errorData = await response.json();
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

  const handleAddProblemClick = () => {
    router.push('/problem-set/create');
  };

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
      {session?.user?.is_admin && (
        <div style={styles.buttonContainer}>
          <button onClick={handleAddProblemClick} style={styles.button}>
            문제 추가
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '85%',
    margin: '0 auto',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  buttonContainer: {
    marginTop: '40px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    display: 'inline-block',
  },
  table: {
    width: '95%',
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
    width: '10%',
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
    color: '#0056b3',
    fontWeight: 'bold',
  },
};
