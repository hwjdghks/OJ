'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function StatusPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [submissions, setSubmissions] = useState([]);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSubmissions() {
      if (!session?.user?.email) return;

      setSubmissionLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/status');
        if (!response.ok) {
          throw new Error('제출 기록을 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        console.log('data from /api/status:', data);
        console.log('type of data:', typeof(data));
        setSubmissions(Array.isArray(data) ? data : []); // 배열 형태가 아닌 경우 빈 배열로 설정
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmissionLoading(false);
      }
    }

    if (session) {
      fetchSubmissions();
    }
  }, [session]);

  if (loading) return <p style={styles.loading}>로딩 중...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>제출 현황</h1>
      {session ? (
        <div style={styles.loggedInContainer}>
          <div style={styles.userInfo}>
            <p>로그인한 사용자: {session.user?.email}</p>
            <button onClick={() => signOut()} style={styles.button}>
              로그아웃
            </button>
          </div>

          {submissionLoading ? (
            <p style={styles.loading}>제출 기록을 불러오는 중...</p>
          ) : error ? (
            <p style={styles.error}>{error}</p>
          ) : submissions.length === 0 ? (
            <p style={styles.noResults}>제출한 기록이 없습니다.</p>
          ) : (
            <div style={styles.scrollContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={{ ...styles.tableCell, ...styles.tableHeaderCell }}>제출 번호</th>
                    <th style={{ ...styles.tableCell, ...styles.tableHeaderCell }}>문제 제목</th>
                    <th style={{ ...styles.tableCell, ...styles.tableHeaderCell }}>언어</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.code_id} style={styles.tableRow}>
                      <td style={{ ...styles.tableCell, ...styles.tableCellId }}>
                        <Link href={`/code/${submission.code_id}`} style={styles.link}>
                          {submission.code_id}
                        </Link>
                      </td>
                      <td style={{ ...styles.tableCell }}>
                        <Link href={`/problem/${submission.problem_id}`} style={styles.link}>
                          {submission.title}
                        </Link>
                      </td>
                      <td style={{ ...styles.tableCell, ...styles.tableCellCenter }}>
                        {submission.language}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div style={styles.loginContainer}>
          <button onClick={() => signIn()} style={styles.button}>
            소셜 로그인
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
  userInfo: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: "#4285f4",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  loading: {
    fontSize: '1rem',
    color: '#007bff',
  },
  error: {
    fontSize: '1rem',
    color: '#dc3545',
  },
  loggedInContainer: {
    width: '100%',
  },
  loginContainer: {
    textAlign: 'center',
    marginTop: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  tableHeader: {
    backgroundColor: '#f4f4f4',
    fontWeight: 'bold',
    borderBottom: '2px solid #ddd',
  },
  tableCell: {
    border: '1px solid #ddd',
    padding: '12px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  tableHeaderCell: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableCellId: {
    textAlign: 'right',
    width: '15%',
  },
  tableCellCenter: {
    textAlign: 'center',
    width: '15%',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  link: {
    textDecoration: 'none',
    color: '#0056b3',
    fontWeight: 'bold',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  noResults: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666',
  },
  scrollContainer: {
    overflowX: 'auto',
    marginTop: '20px',
  },
};