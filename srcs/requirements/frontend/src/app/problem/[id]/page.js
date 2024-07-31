'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProblemPage()  {
  const router = useRouter();
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) { 
      return;
    }

    const fetchProblem = async () => {
      try {
        const response = await fetch(`/api/problem/${id}`);
        if (!response.ok) {
          throw new Error('문제를 가져오는 데 실패했습니다.');
        }
        const data = await response.json();
        setProblem(data);
        console.log(problem);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);
  
  const handleSubmitClick = () => {
    if (id) {
      router.push(`/submit/${id}`); // 버튼 클릭 시 페이지 이동
    }
  };
  
  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>문제를 가져오는 데 실패했습니다: {error.message}</p>;

  return (
    <div>
      {problem ? (
        <div>
          <h1>{problem.title}</h1>
          <pre>{problem.description}</pre>
          <button onClick={handleSubmitClick}>제출하기</button>
        </div>
      ) : (
        <p>문제를 찾을 수 없습니다.</p>
      )}
    </div>
  );
}
