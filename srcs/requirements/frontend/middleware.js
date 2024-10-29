import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log('미들웨어 접근', token);
  if (!token || !token.is_admin) {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  return NextResponse.next();
}

// `/admin` 경로와 하위 디렉토리 경로에 대해 middleware 활성화
export const config = {
  matcher: ["/admin/:path*"],
};
