// middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl; // 요청의 경로를 가져옵니다.

  // problem_id를 추출하기 위해 정규식을 사용합니다.
  const problemIdMatch = pathname.match(/^\/problem\/([0-9]+)\/update$/);
  const problemId = problemIdMatch ? problemIdMatch[1] : null;

  console.log("관리자 페이지 접근:", token);
  console.log("problem_id:", problemId); // problem_id 확인용 로그
  if (!token || !token.is_admin) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/problem-set/create", "/problem/[0-9]+/update"],
};
