'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProblemPage() {
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
    <div className="container mx-auto p-6">
      {problem ? (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h1 className="text-3xl font-bold mb-4">{problem.title}</h1>
            <table className="w-full border-collapse border border-gray-200">
              <tbody>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-right">메모리 제한 </th>
                  <td className="border border-gray-300 px-4 py-2">{problem.memory_limit} MB</td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-right">  시간 제한 </th>
                  <td className="border border-gray-300 px-4 py-2">{problem.time_limit} 초</td>
                </tr>
              </tbody>
            </table>
            {/* 표 스타일로 메모리와 시간 제한 표시 */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">문제</h2>
            </div>

            {/* 문제 설명 표시 */}
            <p className="text-gray-700 mb-Z">{problem.description}</p>
            
            {/* 입력 및 출력 섹션 */}
            <div className="bg-gray-100 p-4 rounded-md mb-6">
              <h2 className="text-xl font-semibold mb-2">입력</h2>
              <pre className="whitespace-pre-wrap text-l">{problem.input}</pre>
            </div>
            <div className="bg-gray-100 p-4 rounded-md mb-6">
              <h2 className="text-xl font-semibold mb-2">출력</h2>
              <pre className="whitespace-pre-wrap text-l">{problem.output}</pre>
            </div>

            <button
              onClick={handleSubmitClick}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              제출하기
            </button>
          </div>
        </div>
      ) : (
        <p>문제를 찾을 수 없습니다.</p>
      )}
    </div>
  );
}
