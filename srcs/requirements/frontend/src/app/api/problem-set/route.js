export async function GET() {
  try {
    const backendUrl = 'http://backend:5000/problem-set';
    const response = await fetch(backendUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // JSON 응답을 파싱합니다.
    const data = await response.json();
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

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('데이터:', JSON.stringify(data, null, 2));

    const backendUrl = 'http://backend:5000/problem-set';
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const responseData = await backendResponse.json();

    return new Response(JSON.stringify({
      message: '문제가 성공적으로 생성되었습니다.',
      data: responseData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing problem creation:', error);

    return new Response(JSON.stringify({
      message: '문제 생성 중 오류가 발생했습니다.',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}