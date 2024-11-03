'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CodePage() {
  const { code_id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code_id) return;

    const fetchSubmission = async () => {
      try {
        const response = await fetch(`/api/code/${code_id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || '제출한 소스 코드를 가져오는 데 실패했습니다.');
        }
        const data = await response.json();
        setSubmission(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [code_id]);

  if (loading) return <p style={styles.loading}>로딩 중...</p>;
  if (error) return <p style={styles.error}>제출한 소스 코드를 가져오는 데 실패했습니다: {error.message}</p>;

  return (
    <div style={styles.container}>
      {submission ? (
        <div style={styles.problemContainer}>
          <div style={styles.section}>
            <h1 style={styles.title}>제출 코드 상세</h1>
            <table style={styles.table}>
              <tbody>
                <tr style={styles.tableRow}>
                  <th style={{ ...styles.tableCell, ...styles.tableHeaderCell, width: '50px'}}>언어</th>
                  <td style={{...styles.tableCell, width: '100px'}}>{submission.language}</td>
                </tr>
                {/* <tr style={styles.tableRow}>
                  <th style={{ ...styles.tableCell, ...styles.tableHeaderCell }}>제출 시간</th>
                  <td style={styles.tableCell}>
                    {new Date(submission.created_at).toLocaleString()}
                  </td>
                </tr> */}
              </tbody>
            </table>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>소스 코드</h2>
            <pre style={styles.pre}>{submission.code_content}</pre>
          </div>

          {submission.error_log && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>에러 로그</h2>
              <pre style={{...styles.pre, backgroundColor: '#fff3f3', color: '#dc3545'}}>
                {submission.error_log}
              </pre>
            </div>
          )}

          {submission.ai_reason && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>알고리즘 분석 결과</h2>
              <div style={styles.description}>
                <pre style={{...styles.pre, backgroundColor: '#f8f9fa'}}>
                  {submission.ai_reason}
                </pre>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p style={styles.error}>소스 코드를 찾을 수 없습니다.</p>
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
    width: '150px',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  tableRow: {
    borderBottom: '1px solid #ddd',
  },
  tableCell: {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'center',
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
    fontSize: '1rem',
    fontFamily: 'monospace',
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