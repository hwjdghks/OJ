'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const resultsPerPage = 20;

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/results?page=${currentPage}&limit=${resultsPerPage}`); // Adjust your API endpoint if needed
        if (!response.ok) {
          const errorData = await response.json(); // 서버의 에러 메시지를 받아옵니다.
          throw new Error(errorData.message || '채점 결과를 가져오는 데 실패했습니다.');
        }
        const data = await response.json();
        setResults(data.results);
        setTotalPages(Math.ceil(data.totalResults / resultsPerPage)); // Assuming totalResults is the total number of results
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  if (loading) return <p style={styles.loading}>로딩 중...</p>;
  if (error) return <p style={styles.error}>오류 발생: {error}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>채점 결과</h2>
      {results.length === 0 ? (
        <p style={styles.noResults}>등록된 채점 결과가 없습니다.</p>
      ) : (
        <>
          <div style={styles.scrollContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={{ ...styles.tableCell, ...styles.tableHeaderCellId, ...styles.tableHeaderCellSubmitId }}>제출 번호</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeaderCellId, ...styles.tableHeaderCellProblemId }}>문제 번호</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeaderCellResult }}>체점 결과</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeaderCellResult }}>분석 결과</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeaderCellLanguage }}>ID</th>
                  <th style={{ ...styles.tableCell, ...styles.tableHeaderCellLanguage }}>언어</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.code_id} style={styles.tableRow}>
                    <td style={{ ...styles.tableCell, ...styles.tableCellId, ...styles.tableCellSeparator }}>
                      <Link href={`/code/${result.code_id}`} style={styles.link}>
                        {result.code_id}
                      </Link>
                    </td>
                    <td style={{ ...styles.tableCell, ...styles.tableCellId, ...styles.tableCellSeparator }}>
                      <Link href={`/problem/${result.problem_id}`} style={styles.link}>
                        {result.problem_id}
                      </Link>
                    </td>
                    <td style={{ ...styles.tableCell, ...styles.tableCellTitle }}>
                      {result.submit_result === 0 && <span style={styles.statusPending}>채점 진행 전</span>}
                      {result.submit_result === 10 && <span style={styles.statusAccepted}>정답</span>}
                      {result.submit_result === 20 && <span style={styles.statusWrong}>틀렸습니다</span>}
                      {result.submit_result === 30 && <span style={styles.statusCompileError}>컴파일 에러</span>}
                      {result.submit_result === 40 && <span style={styles.statusRuntimeError}>런타임 에러</span>}
                      {result.submit_result === 50 && <span style={styles.statusWrong}>시간 초과</span>}
                      {![0, 10, 20, 30, 40, 50].includes(result.submit_result) && <span>{result.submit_result}</span>}
                    </td>
                    <td style={{ ...styles.tableCell, ...styles.tableCellTitle }}>
                      {result.ai_result}
                    </td>
                    <td style={{ ...styles.tableCell, ...styles.tableCellTitle }}>
                      {result.user_id}
                    </td>
                    <td style={{ ...styles.tableCell, ...styles.tableCellTitle }}>
                      {result.language}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.pagination}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              style={currentPage === 1 ? { ...styles.paginationButton, ...styles.hiddenButton } : styles.paginationButton}
            >
              이전
            </button>
            <span style={styles.pageInfo}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={currentPage === totalPages ? { ...styles.paginationButton, ...styles.hiddenButton } : styles.paginationButton}
            >
              다음
            </button>
          </div>
        </>
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
  },
  tableHeaderCellSubmitId: {
    width: '10%',
  },
  tableHeaderCellProblemId: {
    width: '10%',
  },
  tableHeaderCellResult: {
    width: '30%',
  },
  tableHeaderCellLanguage: {
    width: '20%',
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
    backgroundColor: '#fff',
    '&:nthChild(even)': {
      backgroundColor: '#f9f9f9',
    },
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
  noResults: {
    fontSize: '1rem',
    color: '#333',
  },
  link: {
    textDecoration: 'none',
    color: '#0056b3',
    fontWeight: 'bold',
  },
  statusPending: {
    color: 'gray',
  },
  statusAccepted: {
    color: 'green',
  },
  statusWrong: {
    color: 'red',
  },
  statusCompileError: {
    color: 'purple',
  },
  statusRuntimeError: {
    color: 'orange',
  },
  pagination: {
    marginTop: '20px',
    textAlign: 'center',
  },
  paginationButton: {
    padding: '10px 20px',
    backgroundColor: '#0056b3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '0 10px',
  },
  hiddenButton: {
    visibility: 'hidden', // Hides the button but maintains its space
  },
  pageInfo: {
    fontSize: '1rem',
    margin: '0 10px',
  },
};
