// app/problems/page.js
'use client'
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
                    <Link href={`/problem/${problem.problem_id}`}>
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
    maxWidth: '800px', // 최대 너비 설정
    margin: '0 auto', // 중앙 정렬
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    tableLayout: 'fixed', // 열 너비 고정
  },
  tableHeader: {
    backgroundColor: '#f4f4f4',
    fontWeight: 'bold',
    borderBottom: '2px solid #ddd',
  },
  tableHeaderCellId: {
    textAlign: 'center', // ID 헤더의 텍스트 중앙 정렬
    width: '50px',
  },
  tableCell: {
    border: '1px solid #ddd',
    padding: '8px',
    textOverflow: 'ellipsis', // 긴 내용 생략
    overflow: 'hidden', // 넘치는 내용 숨김
    whiteSpace: 'nowrap', // 줄 바꿈 방지
  },
  tableCellId: {
    textAlign: 'right', // ID 열의 값 우측 정렬
  },
  tableCellTitle: {
    textAlign: 'center', // 제목 열의 텍스트 좌측 정렬
    width: 'calc(100% - 50px)', // 제목 열의 너비를 계산하여 ID 열을 제외합니다.
  },
  tableCellSeparator: {
    borderRight: '1px solid #ddd',
  },
  tableRow: {
    backgroundColor: '#fff',
    '&:nthChild(even)': {
      backgroundColor: '#f9f9f9',
    },
  },
  scrollContainer: {
    overflowX: 'auto', // 가로 스크롤 허용
  },
};