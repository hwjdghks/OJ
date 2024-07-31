// app/api/submit/route.js
export async function POST(request) {
    try {
      const { id, language, code } = await request.json();
  
      const response = await fetch('http://backend:5000/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, language, code }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit code');
      }
  
      return new Response(JSON.stringify({ message: 'Code submitted successfully!' }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  