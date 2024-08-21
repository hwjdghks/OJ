'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch problems data from the API
    async function fetchResults() {
      try {
        const response = await fetch('/api/results'); // Ensure this matches the endpoint provided in your route.js
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setResults(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={styles.container}>
      <h2>문제 목록</h2>
      {results.length === 0 ? (
        <p>등록된 문제가 없습니다.</p>
      ) : (
        <div style={styles.scrollContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={{ ...styles.tableCell, ...styles.tableHeaderCellId }}>제출 번호</th>
                <th style={{ ...styles.tableCell, ...styles.tableHeaderCellId }}>문제 번호</th>
                <th style={styles.tableCell}>체점 결과</th>
                <th style={styles.tableCell}>언어</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.code_id} style={styles.tableRow}>
                  <td style={{ ...styles.tableCell, ...styles.tableCellId, ...styles.tableCellSeparator }}>
                  <Link href={`/code/${result.code_id}`}>
                    {result.code_id}
                    </Link>
                  </td>
                  <td style={{ ...styles.tableCell, ...styles.tableCellId, ...styles.tableCellSeparator }}>
                    <Link href={`/problem/${result.problem_id}`}>
                    {result.problem_id}
                    </Link>
                  </td>
                  <td style={{ ...styles.tableCell, ...styles.tableCellTitle }}>
                  {result.submit_result}
                  </td>
                  <td style={{ ...styles.tableCell, ...styles.tableCellTitle }}>
                  {result.language}
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
    width: '100px',
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
    width: 'calc(100% - 200px)', // 제목 열의 너비를 계산하여 ID 열을 제외합니다.
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