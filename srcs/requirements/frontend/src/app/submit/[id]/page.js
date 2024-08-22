// app/submit/[id]/page.js
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const SubmitPage = ({ params }) => {
  const router = useRouter();
  const { id } = params; // URL의 [id]를 가져옵니다.
  
  const [language, setLanguage] = useState('C');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
          id,
          language,
          code,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // 성공적으로 제출되면 페이지를 리디렉션하거나 사용자에게 성공 메시지를 표시합니다.
      alert('Code submitted successfully!');
    } catch (error) {
      setError('Failed to submit code: ' + error.message);
    } finally {
      setIsSubmitting(false);
      router.push(`/results`);
    }
  };

  return (
    <div>
      <h1>Submit Code</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div>
          <label htmlFor="language">Language:</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="C">C</option>
            <option value="C++">C++</option>
            {/* <option value="Python">Python</option> */}
            {/* 추가적인 언어 옵션을 여기에 추가할 수 있습니다 */}
          </select>
        </div>
        <div>
          <label htmlFor="code">Code:</label>
          <textarea
            id="code"
            rows="10"
            cols="50"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default SubmitPage;
