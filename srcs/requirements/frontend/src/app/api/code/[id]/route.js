// app/api/problem/route.js

export async function GET(request, { params }) {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ message: '문제 ID가 필요합니다.' }), { status: 400 });
  }

  try {
   // 백엔드 서버의 주소와 포트 번호를 설정합니다.
   const backendUrl = `http://backend:5000/code?id=${id}`; // Docker Compose 서비스 이름과 포트 번호에 맞게 설정합니다.

   // 백엔드 서버에 GET 요청을 보냅니다.
   const response = await fetch(backendUrl, { cache: 'no-store' });
   console.log(response);
   // 응답 상태 코드 확인
   if (!response.ok) {
     throw new Error(`HTTP error! Status: ${response.status}`);
   }
   // JSON 응답을 파싱합니다.
   const data = await response.json();
    if (!data) {
      return new Response(JSON.stringify({ message: '문제를 찾을 수 없습니다.' }), { status: 404 });
    }
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: '서버 오류가 발생했습니다.' }), { status: 500 });
  }
}