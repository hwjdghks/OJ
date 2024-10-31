'use client';

import { useState } from 'react';

export default function ProblemCreationPage() {
  const [formData, setFormData] = useState({
    languages: ['C', 'C++', 'Java', 'Python'],
    title: '',
    description: '',
    inputDescription: '',
    outputDescription: '',
    examples: [{ input: '', output: '' }],
    memoryLimit: 256,
    timeLimit: 1,
    memoryLimitAdjusted: true,
    timeLimitAdjusted: true,
    gradingFormatApplied: true,
    whitespaceTrimmed: false,
    emptyLineTrimmed: false,
    aiGradingApplied: false,
    aiGradingCriteria: '',
    hardCodingDetected: false,
    gradingData: [{ input: '', output: '' }],
  });

  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const handleExampleChange = (index, field, value) => {
    const newExamples = [...formData.examples];
    newExamples[index][field] = value;
    setFormData(prev => ({ ...prev, examples: newExamples }));
  };

  const handleGradingDataChange = (index, field, value) => {
    const newGradingData = [...formData.gradingData];
    newGradingData[index][field] = value;
    setFormData(prev => ({ ...prev, gradingData: newGradingData }));
  };

  const handleExampleAdd = () => {
    if (formData.examples.length < 3) {
      setFormData((prev) => ({
        ...prev,
        examples: [...prev.examples, { input: '', output: '' }],
      }));
    }
  };

  const handleGradingDataAdd = () => {
    setFormData((prev) => ({
      ...prev,
      gradingData: [...prev.gradingData, { input: '', output: '' }],
    }));
  };

  const handleCheckboxToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
      [`${field}Criteria`]: prev[field] ? '' : prev[`${field}Criteria`]
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.problemContainer}>
        <h1 style={styles.title}>문제 생성</h1>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>제출 가능한 언어 목록</h2>
          <div style={styles.languageButtonGroup}>
            <button onClick={() => toggleAllLanguages(true)} style={styles.smallButton}>전체 선택</button>
            <button onClick={() => toggleAllLanguages(false)} style={styles.smallButton}>전체 해제</button>
          </div>
          <div style={styles.languageCheckboxGroup}>
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

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>기본 정보</h2>
          <input
            type="text"
            placeholder="제목"
            style={styles.input}
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
          />

          <textarea
            placeholder="설명"
            style={styles.textarea}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />

          <textarea
            placeholder="입력 설명"
            style={styles.textarea}
            value={formData.inputDescription}
            onChange={(e) => handleInputChange('inputDescription', e.target.value)}
          />

          <textarea
            placeholder="출력 설명"
            style={styles.textarea}
            value={formData.outputDescription}
            onChange={(e) => handleInputChange('outputDescription', e.target.value)}
          />
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>입출력 예제</h2>
          {formData.examples.map((example, index) => (
            <div key={index} style={styles.exampleContainer}>
              <div style={styles.exampleLabel}>{`예제 ${index + 1}`}</div>
              <div style={styles.exampleRow}>
                <div style={styles.exampleColumn}>
                  <textarea
                    placeholder="입력"
                    style={styles.exampleTextarea}
                    value={example.input}
                    onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                  />
                </div>
                <div style={styles.exampleColumn}>
                  <textarea
                    placeholder="출력"
                    style={styles.exampleTextarea}
                    value={example.output}
                    onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          {formData.examples.length < 3 && (
            <button onClick={handleExampleAdd} style={styles.button}>예제 추가</button>
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>실행 제한</h2>
          <div style={styles.limitRow}>
            <div style={styles.limitField}>
              <label style={styles.label}>메모리 제한 (MB)</label>
              <input
                type="number"
                style={styles.input}
                value={formData.memoryLimit}
                onChange={(e) => handleInputChange('memoryLimit', e.target.value)}
              />
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    checked={formData.memoryLimitAdjusted}
                    onChange={() => handleInputChange('memoryLimitAdjusted', true)}
                  />
                  보정 활성화
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    checked={!formData.memoryLimitAdjusted}
                    onChange={() => handleInputChange('memoryLimitAdjusted', false)}
                  />
                  보정 비활성화
                </label>
              </div>
            </div>
            <div style={styles.limitField}>
              <label style={styles.label}>시간 제한 (초)</label>
              <input
                type="number"
                style={styles.input}
                value={formData.timeLimit}
                onChange={(e) => handleInputChange('timeLimit', e.target.value)}
              />
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    checked={formData.timeLimitAdjusted}
                    onChange={() => handleInputChange('timeLimitAdjusted', true)}
                  />
                  보정 활성화
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    checked={!formData.timeLimitAdjusted}
                    onChange={() => handleInputChange('timeLimitAdjusted', false)}
                  />
                  보정 비활성화
                </label>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>채점 설정</h2>
          <div style={styles.checkboxSection}>
            <label style={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={formData.aiGradingApplied}
                onChange={() => handleCheckboxToggle('aiGradingApplied')}
              />
              AI 채점 적용
            </label>
            {formData.aiGradingApplied && (
              <textarea
                placeholder="AI 채점 기준"
                style={styles.criteriaTextarea}
                value={formData.aiGradingCriteria}
                onChange={(e) => handleInputChange('aiGradingCriteria', e.target.value)}
              />
            )}
          </div>

          <div style={styles.checkboxSection}>
            <label style={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={formData.hardCodingDetected}
                onChange={() => handleCheckboxToggle('hardCodingDetected')}
              />
              하드코딩 감지 적용
            </label>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>채점 데이터</h2>
          {formData.gradingData.map((data, index) => (
            <div key={index} style={styles.exampleContainer}>
              <div style={styles.exampleLabel}>{`데이터 ${index + 1}`}</div>
              <div style={styles.exampleRow}>
                <div style={styles.exampleColumn}>
                  <textarea
                    placeholder="입력"
                    style={styles.exampleTextarea}
                    value={data.input}
                    onChange={(e) => handleGradingDataChange(index, 'input', e.target.value)}
                  />
                </div>
                <div style={styles.exampleColumn}>
                  <textarea
                    placeholder="출력"
                    style={styles.exampleTextarea}
                    value={data.output}
                    onChange={(e) => handleGradingDataChange(index, 'output', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          <button onClick={handleGradingDataAdd} style={styles.button}>데이터 추가</button>
        </div>
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
    marginBottom: '24px',
    color: '#333',
  },
  section: {
    marginBottom: '32px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    backgroundColor: '#fff',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    marginBottom: '16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    minHeight: '100px',
    resize: 'vertical',
    backgroundColor: '#fff',
    fontFamily: 'Arial, sans-serif',
  },
  criteriaTextarea: {
    width: '100%',
    padding: '10px',
    marginTop: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    minHeight: '80px',
    resize: 'vertical',
    backgroundColor: '#fff',
    fontFamily: 'Arial, sans-serif',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#0056b3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginTop: '8px',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#004494',
    },
  },
  smallButton: {
    padding: '6px 12px',
    backgroundColor: '#0056b3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '500',
    marginRight: '8px',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#004494',
    },
  },
  languageButtonGroup: {
    marginBottom: '12px',
  },
  languageCheckboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.9rem',
    color: '#333',
    cursor: 'pointer',
  },
  limitRow: {
    display: 'flex',
    gap: '24px',
    marginBottom: '16px',
  },
  limitField: {
    flex: 1,
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '0.9rem',
    color: '#333',
    fontWeight: '500',
  },
  radioGroup: {
    marginTop: '8px',
    display: 'flex',
    gap: '16px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.9rem',
    color: '#333',
    cursor: 'pointer',
  },
  exampleContainer: {
    marginBottom: '20px',
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  exampleLabel: {
    fontSize: '1rem',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#333',
  },
  exampleRow: {
    display: 'flex',
    gap: '16px',
  },
  exampleColumn: {
    flex: 1,
  },
  exampleTextarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    minHeight: '80px',
    resize: 'vertical',
    backgroundColor: '#fff',
    fontFamily: 'Arial, sans-serif',
  },
  checkboxSection: {
    marginBottom: '16px',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#333',
    cursor: 'pointer',
  },
  pre: {
    backgroundColor: '#f5f5f5',
    padding: '12px',
    borderRadius: '4px',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    fontSize: '1rem',
  },
};