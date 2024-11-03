// app/api/status/route.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user_id = encodeURIComponent(session.user.user_id);
    const response = await fetch(`http://backend:5000/status/${user_id}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('백엔드 서버 요청 실패');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: '제출 기록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}