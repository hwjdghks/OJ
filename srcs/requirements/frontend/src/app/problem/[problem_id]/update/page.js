'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProblemEditPage({ params }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    languages: ['C', 'C++', 'Java', 'Python'],
    title: '',
    description: '',
    input: '',
    output: '',
    examples: [{ input_example: '', output_example: '' }],
    memory_limit: 256,
    time_limit: 1,
    memory_balance: true,
    time_balance: true,
    is_basic_format: true,
    is_delete_white_space: false,
    is_delete_blank_line: false,
    use_ai_grade: true,
    grade_guide: '',
    use_detect_hardcode: true,
    gradingData: [{ input: '', output: '' }],
  });

  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProblemData = async () => {
      try {
        const response = await fetch(`/api/problem/${params.problem_id}/update`);
        if (!response.ok) {
          throw new Error('문제 정보를 불러오는데 실패했습니다.');
        }
        const data = await response.json();

        setFormData(prev => ({
          ...prev,
          ...data,
          examples: data.examples || [{ input_example: '', output_example: '' }],
          gradingData: data.gradingData || [{ input: '', output: '' }]
        }));
        setSelectedLanguages(data.languages || []);
        setIsLoading(false);
      } catch (error) {
        setSubmitStatus({ type: 'error', message: error.message });
        setIsLoading(false);
      }
    };

    fetchProblemData();
  }, [params.problem_id]);

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
        examples: [...prev.examples, { input_example: '', output_example: '' }],
      }));
    }
  };

  const handleGradingDataAdd = () => {
    setFormData((prev) => ({
      ...prev,
      gradingData: [...prev.gradingData, { input: '', output: '' }],
    }));
  };

  const handleDeleteExample = (index) => {
    const updatedExamples = formData.examples.filter((_, i) => i !== index);
    setFormData({ ...formData, examples: updatedExamples });
  };

  const handleDeleteGradingData = (index) => {
    const updatedGradingData = formData.gradingData.filter((_, i) => i !== index);
    setFormData({ ...formData, gradingData: updatedGradingData });
  };

  const handleSubmit = async () => {
    // 기본적인 유효성 검사
    if (!formData.title.trim()) {
      setSubmitStatus({ type: 'error', message: '제목을 입력해주세요.' });
      return;
    }

    if (!formData.description.trim()) {
      setSubmitStatus({ type: 'error', message: '설명을 입력해주세요.' });
      return;
    }

    if (selectedLanguages.length === 0) {
      setSubmitStatus({ type: 'error', message: '최소 하나의 언어를 선택해주세요.' });
      return;
    }

    try {
      const response = await fetch(`/api/problem/${params.problem_id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          languages: selectedLanguages,
        }),
      });

      if (!response.ok) {
        throw new Error('문제 수정에 실패했습니다.');
      }

      alert('문제가 수정되었습니다.');
      router.push('/problem-set');

    } catch (error) {
      setSubmitStatus({ type: 'error', message: error.message });
    }
  };

  if (isLoading) {
    return <div>로딩중...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.problemContainer}>
        <h1 style={styles.title}>문제 수정</h1>

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
            value={formData.input}
            onChange={(e) => handleInputChange('input', e.target.value)}
          />

          <textarea
            placeholder="출력 설명"
            style={styles.textarea}
            value={formData.output}
            onChange={(e) => handleInputChange('output', e.target.value)}
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
                    value={example.input_example}
                    onChange={(e) => handleExampleChange(index, 'input_example', e.target.value)}
                  />
                </div>
                <div style={styles.exampleColumn}>
                  <textarea
                    placeholder="출력"
                    style={styles.exampleTextarea}
                    value={example.output_example}
                    onChange={(e) => handleExampleChange(index, 'output_example', e.target.value)}
                  />
                </div>
                <button onClick={() => handleDeleteExample(index)} style={styles.deleteButton}>삭제</button>
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
                value={formData.memory_limit}
                onChange={(e) => handleInputChange('memory_limit', e.target.value)}
              />
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    checked={formData.memory_balance}
                    onChange={() => handleInputChange('memory_balance', true)}
                  />
                  보정 활성화
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    checked={!formData.memory_balance}
                    onChange={() => handleInputChange('memory_balance', false)}
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
                value={formData.time_limit}
                onChange={(e) => handleInputChange('time_limit', e.target.value)}
              />
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    checked={formData.time_balance}
                    onChange={() => handleInputChange('time_balance', true)}
                  />
                  보정 활성화
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    checked={!formData.time_balance}
                    onChange={() => handleInputChange('time_balance', false)}
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
                checked={formData.is_basic_format}
                onChange={(e) => handleInputChange('is_basic_format', e.target.checked)}
              />
              채점 형식 적용
            </label>
            <label style={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={formData.is_delete_white_space}
                onChange={(e) => handleInputChange('is_delete_white_space', e.target.checked)}
              />
              공백 제거
            </label>
            <label style={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={formData.is_delete_blank_line}
                onChange={(e) => handleInputChange('is_delete_blank_line', e.target.checked)}
              />
              빈 줄 제거
            </label>
            <label style={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={formData.use_ai_grade}
                onChange={(e) => handleInputChange('use_ai_grade', e.target.checked)}
              />
              AI 채점 적용
            </label>
            {formData.use_ai_grade && (
              <textarea
                placeholder="AI 채점 기준"
                style={styles.criteriaTextarea}
                value={formData.grade_guide}
                onChange={(e) => handleInputChange('grade_guide', e.target.value)}
              />
            )}
            <label style={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={formData.use_detect_hardcode}
                onChange={(e) => handleInputChange('use_detect_hardcode', e.target.checked)}
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
                <button onClick={() => handleDeleteGradingData(index)} style={styles.deleteButton}>삭제</button>
              </div>
            </div>
          ))}
          <button onClick={handleGradingDataAdd} style={styles.button}>데이터 추가</button>
        </div>

        {submitStatus.message && (
          <div style={styles.alertContainer}>
            <div style={{
              ...styles.alert,
              ...(submitStatus.type === 'error' ? styles.errorAlert : styles.successAlert)
            }}>
              <strong style={styles.alertTitle}>
                {submitStatus.type === 'error' ? '오류' : '성공'}
              </strong>
              <p style={styles.alertMessage}>{submitStatus.message}</p>
            </div>
          </div>
        )}

        <div style={styles.submitSection}>
          <button
            onClick={handleSubmit}
            style={styles.submitButton}
          >
            문제 수정하기
          </button>
        </div>
      </div>
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
    width: '95%',
    padding: '10px',
    marginBottom: '16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    backgroundColor: '#fff',
  },
  textarea: {
    width: '95%',
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
    width: '95%',
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
    fontSize: '1rem',
    fontWeight: '500',
    marginTop: '8px',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#004494',
    },
  },
  deleteButton: {
    backgroundColor: '#ff4d4d', // 삭제 버튼 배경색
    color: '#fff', // 텍스트 색상
    border: 'none',
    borderRadius: '5px',
    padding: '5px 10px',
    cursor: 'pointer',
    marginLeft: '10px', // 여백 추가
  },
  smallButton: {
    padding: '6px 12px',
    backgroundColor: '#0056b3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
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
    fontSize: '1rem',
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
    fontSize: '1rem',
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
    fontSize: '1rem',
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
    width: '95%',
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    minHeight: '80px',
    resize: 'vertical',
    backgroundColor: '#fff',
    fontFamily: 'Arial, sans-serif',
  },
  checkboxSection: {
    marginBottom: '10px',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1rem',
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
  alert: {
    padding: '16px',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  errorAlert: {
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    color: '#dc2626',
  },
  successAlert: {
    backgroundColor: '#dcfce7',
    border: '1px solid #22c55e',
    color: '#16a34a',
  },
  alertTitle: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  alertMessage: {
    margin: 0,
    fontSize: '1rem',
  },
};