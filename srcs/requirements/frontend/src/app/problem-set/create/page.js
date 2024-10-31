'use client';

import { useState } from 'react';

export default function ProblemCreationPage() {
  const [formData, setFormData] = useState({
    languages: ['C', 'C++', 'Java', 'Python'],
    title: '',
    description: '',
    inputDescription: '',
    outputDescription: '',
    examples: [],
    memoryLimit: 128,
    timeLimit: 2,
    memoryLimitAdjusted: true,
    timeLimitAdjusted: true,
    gradingFormatApplied: true,
    whitespaceTrimmed: false,
    emptyLineTrimmed: false,
    aiGradingApplied: false,
    aiGradingCriteria: '',
    hardCodingDetected: false,
    gradingData: [],
  });

  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [exampleCount, setExampleCount] = useState(1);
  const [gradingDataCount, setGradingDataCount] = useState(1);

  const handleLanguageToggle = (language) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((lang) => lang !== language)
        : [...prev, language]
    );
  };

  const toggleAllLanguages = (selectAll) => {
    setSelectedLanguages(selectAll ? [...formData.languages] : []);
  };

  const handleRadioChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExampleAdd = () => {
    if (formData.examples.length < 3) {
      setFormData((prev) => ({
        ...prev,
        examples: [...prev.examples, { input: '', output: '' }],
      }));
      setExampleCount((prev) => prev + 1);
    }
  };

  const handleGradingDataAdd = () => {
    setFormData((prev) => ({
      ...prev,
      gradingData: [...prev.gradingData, { input: '', output: '' }],
    }));
    setGradingDataCount((prev) => prev + 1);
  };

  const handleAIGradingToggle = () => {
    setFormData((prev) => ({
      ...prev,
      aiGradingApplied: !prev.aiGradingApplied,
      aiGradingCriteria: !prev.aiGradingApplied ? '' : prev.aiGradingCriteria,
    }));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>문제 생성</h1>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>제출 가능한 언어 목록</h2>
        <div style={styles.languageCheckboxGroup}>
          <button onClick={() => toggleAllLanguages(true)} style={styles.languageToggleButton}>전체 선택</button>
          <button onClick={() => toggleAllLanguages(false)} style={styles.languageToggleButton}>전체 해제</button>
          {formData.languages.map((lang) => (
            <label key={lang} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedLanguages.includes(lang)}
                onChange={() => handleLanguageToggle(lang)}
              />
              {lang}
            </label>
          ))}
        </div>
      </div>

      <input type="text" placeholder="제목" style={styles.input} value={formData.title} />

      <textarea placeholder="설명" style={styles.textarea} value={formData.description} />

      <input type="text" placeholder="입력 설명" style={styles.input} value={formData.inputDescription} />

      <input type="text" placeholder="출력 설명" style={styles.input} value={formData.outputDescription} />

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>입출력 예제</h2>
        {formData.examples.map((example, index) => (
          <div key={index} style={styles.exampleRow}>
            <span>{`예제 ${index + 1}`}</span>
            <input type="text" placeholder="입력" style={styles.exampleInput} />
            <input type="text" placeholder="출력" style={styles.exampleInput} />
          </div>
        ))}
        <button onClick={handleExampleAdd} style={styles.addButton}>예제 추가</button>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>메모리 제한 및 시간 제한</h2>
        <input type="number" placeholder="메모리 제한 (MB)" style={styles.input} value={formData.memoryLimit} />
        <input type="number" placeholder="시간 제한 (초)" style={styles.input} value={formData.timeLimit} />

        <div style={styles.radioGroup}>
          <label>
            메모리 제한 보정
            <input
              type="radio"
              checked={formData.memoryLimitAdjusted}
              onChange={() => handleRadioChange('memoryLimitAdjusted', true)}
            />
            활성화
            <input
              type="radio"
              checked={!formData.memoryLimitAdjusted}
              onChange={() => handleRadioChange('memoryLimitAdjusted', false)}
            />
            비활성화
          </label>

          <label>
            시간 제한 보정
            <input
              type="radio"
              checked={formData.timeLimitAdjusted}
              onChange={() => handleRadioChange('timeLimitAdjusted', true)}
            />
            활성화
            <input
              type="radio"
              checked={!formData.timeLimitAdjusted}
              onChange={() => handleRadioChange('timeLimitAdjusted', false)}
            />
            비활성화
          </label>

          <label>
            기본 채점 포맷 적용
            <input
              type="radio"
              checked={formData.gradingFormatApplied}
              onChange={() => handleRadioChange('gradingFormatApplied', true)}
            />
            활성화
            <input
              type="radio"
              checked={!formData.gradingFormatApplied}
              onChange={() => handleRadioChange('gradingFormatApplied', false)}
            />
            비활성화
          </label>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>AI 채점</h2>
        <label>
          AI 채점 적용
          <input type="checkbox" checked={formData.aiGradingApplied} onChange={handleAIGradingToggle} />
        </label>
        {formData.aiGradingApplied && (
          <input
            type="text"
            placeholder="AI 채점 기준"
            style={styles.input}
            value={formData.aiGradingCriteria}
          />
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>채점 데이터</h2>
        {formData.gradingData.map((data, index) => (
          <div key={index} style={styles.exampleRow}>
            <span>{`데이터 ${index + 1}`}</span>
            <input type="text" placeholder="입력" style={styles.exampleInput} />
            <input type="text" placeholder="출력" style={styles.exampleInput} />
          </div>
        ))}
        <button onClick={handleGradingDataAdd} style={styles.addButton}>데이터 추가</button>
      </div>
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
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    minHeight: '80px',
    resize: 'vertical',
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
    width: 'fit-content',
  },
  exampleContainer: {
    marginBottom: '20px',
  },
  exampleRow: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #ddd',
    padding: '10px 0',
  },
  exampleInput: {
    width: 'calc(50% - 10px)',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    marginRight: '10px',
    fontSize: '1rem',
  },
  checkboxLabel: {
    display: 'block',
    fontSize: '1rem',
    marginBottom: '8px',
  },
  languageCheckboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '10px',
  },
  languageToggleButton: {
    padding: '8px 12px',
    marginBottom: '5px',
    backgroundColor: '#0056b3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
  },
};
