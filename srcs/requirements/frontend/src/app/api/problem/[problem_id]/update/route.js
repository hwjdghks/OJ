import { NextResponse } from 'next/server';

// GET: 문제 정보 불러오기
export async function GET(request, { params }) {
  try {
    const response = await fetch(`http://backend:5000/problem/${params.problem_id}/update`, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('Failed to fetch problem data');
    }

    const data = await response.json();
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: '문제 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 문제 정보 수정하기
export async function POST(request, { params }) {
  try {
    const body = await request.json();

    const response = await fetch(`http://backend:5000/problem/${params.problem_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to update problem');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: '문제 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}