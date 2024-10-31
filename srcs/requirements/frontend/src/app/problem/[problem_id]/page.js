'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProblemPage() {
  const router = useRouter();
  const { problem_id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!problem_id) return;

    const fetchProblem = async () => {
      try {
        const response = await fetch(`/api/problem/${problem_id}`);
        if (!response.ok) {
          const errorData = await response.json(); // 서버의 에러 메시지를 받아옵니다.
          throw new Error(errorData.message || '문제를 가져오는 데 실패했습니다.');
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
  }, [problem_id]);

  const handleSubmitClick = () => {
    if (problem_id && problem) {
      router.push(`/submit/${problem_id}?title=${encodeURIComponent(problem.title)}`);
    }
  };

  if (loading) return <p style={styles.loading}>로딩 중...</p>;
  if (error) return <p style={styles.error}>문제를 가져오는 데 실패했습니다: {error.message}</p>;

  const hasExamples = problem.examples.length > 0;

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
            <pre style={styles.pre}>{problem.input || '입력이 주어지지 않습니다.'}</pre>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>출력</h2>
            <pre style={styles.pre}>{problem.output || '출력이 주어지지 않습니다.'}</pre>
          </div>

          <div style={styles.section}>
            {hasExamples ? (
              problem.examples.map((example, index) => (
                <div key={index} style={styles.exampleContainer}>
                  <div style={styles.exampleRow}>
                    <div style={styles.exampleColumn}>
                      <div style={styles.exampleLabel}>입력 예제 {index + 1}</div>
                      <div style={styles.exampleContent}>
                        {example.input_example || '입력이 주어지지 않습니다.'}
                      </div>
                    </div>
                    <div style={styles.exampleColumn}>
                      <div style={styles.exampleLabel}>출력 예제 {index + 1}</div>
                      <div style={styles.exampleContent}>
                        {example.output_example || '출력이 주어지지 않습니다.'}
                      </div>
                    </div>
                  </div>
                  {/* {index < problem.examples.length - 1 && <div style={styles.separator} />} */}
                </div>
              ))
            ) : (
              <div style={styles.exampleContainer}>
                <div style={styles.exampleRow}>
                  <div style={styles.exampleColumn}>
                    <div style={styles.exampleLabel}>입력 예제 1</div>
                    <div style={styles.exampleContent}>입력이 주어지지 않습니다.</div>
                  </div>
                  <div style={styles.exampleColumn}>
                    <div style={styles.exampleLabel}>출력 예제 1</div>
                    <div style={styles.exampleContent}>출력이 주어지지 않습니다.</div>
                  </div>
                </div>
              </div>
            )}
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
    width: '95%',
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
    fontSize: '1rem',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#0056b3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: '10px',
    width: 'fit-content',
  },
  loading: {
    fontSize: '1rem',
    color: '#007bff',
  },
  error: {
    fontSize: '1rem',
    color: '#dc3545',
  },
  exampleContainer: {
    marginBottom: '20px',
  },
  exampleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #ddd',
    paddingBottom: '10px',
    paddingTop: '10px',
  },
  exampleColumn: {
    flex: '1',
    marginRight: '20px',
  },
  exampleLabel: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  exampleContent: {
    backgroundColor: '#f5f5f5',
    padding: '10px',
    borderRadius: '4px',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
  },
  separator: {
    border: '0',
    borderTop: '1px solid #ddd',
    margin: '10px 0',
  },
};
