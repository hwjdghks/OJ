import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // 숫자로 된 경로만 허용하도록 체크합니다.
  const problemIdMatch = pathname.match(/^\/problem\/(\d+)\/update$/);
  const problemId = problemIdMatch ? problemIdMatch[1] : null;

  // 관리자가 아니거나 숫자 경로 형식이 아닌 경우 404로 이동
  if (!token || !token.is_admin || (pathname.startsWith("/problem/") && !problemId)) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/problem-set/create", "/problem/:problem_id/update"], // 모든 보호 경로를 지정
};