import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import NaverProvider from 'next-auth/providers/naver';
import FortyTwoProvider from "next-auth/providers/42-school";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    NaverProvider({
      clientId: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
    }),
    FortyTwoProvider({
      clientId: process.env.FORTY_TWO_CLIENT_ID,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // JWT 콜백에서 user_id를 받아와 JWT 토큰에 저장
    async jwt({ token, user }) {
      if (user) {
        try {
          // 유저 조회 요청
          console.log('유저 정보 조회: ', user.email);
          const userResponse = await fetch(`http://backend:5000/users/${user.email}`);
          console.log('정보 조회 결과: ', userResponse);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            token.user_id = userData.user_id; // 기존 유저의 user_id를 JWT에 저장
          } else if (userResponse.status === 404) {
            // 유저가 없으면 신규 유저 생성
            const newUserResponse = await fetch(`http://backend:5000/users`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_email: user.email,
              }),
            });

            if (newUserResponse.ok) {
              const newUserData = await newUserResponse.json();
              token.user_id = newUserData.user_id; // 신규 유저의 user_id를 JWT에 저장
            } else {
              console.error('Failed to create new user');
            }
          } else {
            console.error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Error during user fetch or creation:', error);
        }
      }

      return token;
    },

    // Session 콜백에서 JWT의 user_id를 세션에 포함
    async session({ session, token }) {
      session.user.user_id = token.user_id; // JWT에서 user_id를 가져와 세션에 저장
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
