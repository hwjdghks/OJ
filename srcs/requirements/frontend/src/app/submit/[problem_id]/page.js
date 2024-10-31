'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

const SubmitPage = ({ params }) => {
  const router = useRouter();
  const searchParams = useSearchParams(); // 추가된 부분
  const { problem_id } = params; // URL의 [id]를 가져옵니다.

  const { data: session } = useSession(); // NextAuth 세션을 가져옵니다

  const [language, setLanguage] = useState('C');
  const [code_content, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const title = searchParams.get('title'); // 쿼리 매개변수에서 제목을 가져옵니다.

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem_id,
          language,
          code_content,
          user_id: session?.user?.user_id // 세션에서 user_id를 가져와서 추가
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      alert('Code submitted successfully!');
      router.push('/results'); // Redirect after successful submission
    } catch (error) {
      setError('Failed to submit code: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>코드 제출</h1>
      {title && <h2 style={styles.title}>{title}</h2>} {/* 문제 제목을 출력 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        style={styles.form}
      >
        <div style={styles.formGroup}>
          <label htmlFor="language" style={styles.label}>언어:</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={styles.select}
          >
            <option value="C">C</option>
            <option value="C++">C++</option>
            <option value="Python">Python 3</option>
            <option value="Java">Java 11</option>
            {/* 추가적인 언어 옵션을 여기에 추가할 수 있습니다 */}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="code" style={styles.label}>소스 코드:</label>
          <textarea
            id="code"
            rows="10"
            value={code_content}
            onChange={(e) => setCode(e.target.value)}
            required
            style={styles.textarea}
          />
        </div>
        <button type="submit" disabled={isSubmitting} style={styles.button}>
          {isSubmitting ? '제출중...' : '제출하기'}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

export default SubmitPage;

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
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '8px',
    display: 'block',
  },
  select: {
    width: '20%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  textarea: {
    width: '95%',
    padding: '15px', // Increased padding for a better code editor feel
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    resize: 'vertical',
    backgroundColor: '#f5f5f5', // Light gray background for better readability
    fontFamily: 'monospace', // Monospace font for code
    lineHeight: '1.5', // Line height for better readability
  },
  button: {
    padding: '10px 20px', // Adjusted padding for a smaller button width
    backgroundColor: '#0056b3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: '10px',
    width: 'fit-content', // Adjust width to fit content
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};
