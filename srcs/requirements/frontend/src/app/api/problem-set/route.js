export async function GET() {
  try {
    // 백엔드 서버의 주소와 포트 번호를 설정합니다.
    const backendUrl = 'http://backend:5000/problem-set'; // Docker Compose 서비스 이름과 포트 번호에 맞게 설정합니다.

    // 백엔드 서버에 GET 요청을 보냅니다.
    const response = await fetch(backendUrl, { cache: 'no-store' });
    // 응답 상태 코드 확인
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // JSON 응답을 파싱합니다.
    const data = await response.json();

    // 성공적으로 데이터를 받아왔을 경우
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching message from backend:', error);

    // 에러가 발생했을 경우
    return new Response(
      JSON.stringify({ message: 'Failed to fetch message.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}