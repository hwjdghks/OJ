'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <SessionProvider>
      <PageContent />
    </SessionProvider>
  );
}

function PageContent() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  if (loading) return <p style={styles.loading}>로딩 중...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>로그인 페이지</h1>
      {session ? (
        <div style={styles.loggedInContainer}>
          <p>로그인한 사용자: {session.user?.email}</p>
          <button onClick={() => signOut()} style={styles.button}>
            로그아웃
          </button>
        </div>
      ) : (
        <div style={styles.loginContainer}>
          <button onClick={() => signIn('google')} style={styles.button}>
            Google로 로그인
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: '600',
    marginBottom: '20px',
  },
  button: {
    backgroundColor: "#4285f4",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    hoverBackgroundColor: "#357ae8",
    logoWidth: "20px",
    logoHeight: "20px",
    logoMarginRight: "10px"
  },
  loading: {
    fontSize: '1rem',
    color: '#007bff',
  },
  loggedInContainer: {
    textAlign: 'center',
  },
  loginContainer: {
    textAlign: 'center',
  },
  linkText: {
    marginTop: '10px',
  },
  link: {
    textDecoration: 'none',
    color: '#0056b3',
    fontWeight: 'bold',
  },
};
