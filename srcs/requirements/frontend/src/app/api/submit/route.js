// app/api/submit/route.js
export async function POST(request) {
  try {
    const { problem_id, language, code_content, user_id } = await request.json(); // user_id를 추출

    const response = await fetch('http://backend:5000/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ problem_id, language, code_content, user_id }), // user_id 포함
    });

    if (!response.ok) {
      throw new Error('Failed to submit code');
    }

    return new Response(JSON.stringify({ message: 'Code submitted successfully!' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
