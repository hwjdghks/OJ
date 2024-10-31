'use client';

import { useState } from 'react';

export default function ProblemCreationPage() {
  const [languages, setLanguages] = useState(['C', 'C++', 'Java', 'Python']);
  const [examples, setExamples] = useState([{ input: '', output: '' }]);
  const [gradingData, setGradingData] = useState([{ input: '', output: '' }]);
  const [exampleCount, setExampleCount] = useState(1);

  const handleAddExample = () => {
    if (examples.length < 3) {
      setExamples([...examples, { input: '', output: '' }]);
    }
  };

  const handleAddGradingData = () => {
    setGradingData([...gradingData, { input: '', output: '' }]);
  };

  const handleExampleChange = (index, field, value) => {
    const updatedExamples = [...examples];
    updatedExamples[index][field] = value;
    setExamples(updatedExamples);
  };

  const handleGradingDataChange = (index, field, value) => {
    const updatedGradingData = [...gradingData];
    updatedGradingData[index][field] = value;
    setGradingData(updatedGradingData);
  };

  return (
    <div style={styles.container}>
      <h1>문제 생성</h1>

      {/* Language selection */}
      <label>제출 가능한 언어 목록</label>
      <div>
        {languages.map((lang, index) => (
          <span key={index} style={styles.language}>{lang}</span>
        ))}
      </div>

      {/* Title and description fields */}
      <div>
        <label>제목</label>
        <input type="text" placeholder="문제 제목을 입력하세요" />
      </div>

      <div>
        <label>설명</label>
        <textarea placeholder="문제 설명을 입력하세요"></textarea>
      </div>

      <div>
        <label>입력 설명</label>
        <textarea placeholder="입력에 대한 설명을 입력하세요"></textarea>
      </div>

      <div>
        <label>출력 설명</label>
        <textarea placeholder="출력에 대한 설명을 입력하세요"></textarea>
      </div>

      {/* Examples */}
      <h2>입출력 예제</h2>
      {examples.map((example, index) => (
        <div key={index} style={styles.exampleContainer}>
          <input
            type="text"
            placeholder="입력 예제"
            value={example.input}
            onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
          />
          <input
            type="text"
            placeholder="출력 예제"
            value={example.output}
            onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
          />
        </div>
      ))}
      {examples.length < 3 && (
        <button onClick={handleAddExample} style={styles.addButton}>+ 예제 추가</button>
      )}

      {/* Grading data */}
      <h2>채점 데이터</h2>
      {gradingData.map((data, index) => (
        <div key={index} style={styles.exampleContainer}>
          <input
            type="text"
            placeholder="입력"
            value={data.input}
            onChange={(e) => handleGradingDataChange(index, 'input', e.target.value)}
          />
          <input
            type="text"
            placeholder="출력"
            value={data.output}
            onChange={(e) => handleGradingDataChange(index, 'output', e.target.value)}
          />
        </div>
      ))}
      <button onClick={handleAddGradingData} style={styles.addButton}>+ 채점 데이터 추가</button>

      {/* Limits and settings */}
      <div>
        <label>메모리 제한</label>
        <input type="number" placeholder="MB 단위" />
      </div>

      <div>
        <label>시간 제한</label>
        <input type="number" placeholder="초 단위" />
      </div>

      <div>
        <label>메모리 제한 보정 적용 여부</label>
        <input type="checkbox" />
      </div>

      <div>
        <label>시간 제한 보정 적용 여부</label>
        <input type="checkbox" />
      </div>

      <div>
        <label>기본 채점 포맷 적용 여부</label>
        <input type="checkbox" />
      </div>

      <div>
        <label>출력 공백 제거 적용 여부</label>
        <input type="checkbox" />
      </div>

      <div>
        <label>출력 빈줄 제거 적용 여부</label>
        <input type="checkbox" />
      </div>

      <div>
        <label>AI 채점 적용 여부</label>
        <input type="checkbox" />
      </div>

      <div>
        <label>AI 채점 기준</label>
        <input type="text" placeholder="AI 채점 기준을 입력하세요" />
      </div>

      <div>
        <label>AI 하드코딩 탐지 적용 여부</label>
        <input type="checkbox" />
      </div>

      <button style={styles.submitButton}>문제 생성</button>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  exampleContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  language: {
    marginRight: '8px',
    backgroundColor: '#eee',
    padding: '5px 10px',
    borderRadius: '5px',
  },
  addButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    cursor: 'pointer',
    borderRadius: '5px',
    marginTop: '5px',
  },
  submitButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#0056b3',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
