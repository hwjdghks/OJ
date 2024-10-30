export async function GET() {
  try {
    const backendUrl = 'http://backend:5000/problem-set';
    const response = await fetch(backendUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // JSON 응답을 파싱합니다.
    const data = await response.json();
    console.log('데이터:', data)
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching message from backend:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to fetch message.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}