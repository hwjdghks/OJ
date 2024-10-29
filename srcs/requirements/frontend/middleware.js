import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req });

  // 토큰이 없거나 관리자가 아닌 경우 리다이렉트
  if (!token || !token.is_admin) {
    return NextResponse.redirect('/403');
  }
  return NextResponse.next();
}

// `/admin` 경로와 하위 디렉토리 경로에 대해 middleware 활성화
export const config = {
  matcher: ["/admin/:path*"],
};
