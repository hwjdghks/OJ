// components/Navbar.js
'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

const Navbar = () => {
  const { data: session, status } = useSession();

  const handleSignIn = async (e) => {
    e.preventDefault(); // 기본 링크 동작 방지
    await signIn(); // 기본 로그인 처리
  };

  const handleSignOut = async (e) => {
    e.preventDefault(); // 기본 링크 동작 방지
    await signOut();
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <h1 style={styles.title}>
          <Link style={styles.navLink} href="/">졸업 작품</Link>
        </h1>
        <ul style={styles.navList}>
          <li style={styles.navListItem}>
            <Link style={styles.navLink} href="/problem-set">문제 리스트</Link>
          </li>
          <li style={styles.navListItem}>
            <Link style={styles.navLink} href="/results">채점 결과</Link>
          </li>
          {session ? (
            <li style={styles.navListItem}>
              <Link style={styles.navLink} href="/signin">{session.user.user_id}</Link>
            </li>
          ) : (
            <></>
          )}
          <li style={styles.navListItem}>
            {status === 'authenticated' ? (
              <Link
                href="/"
                style={styles.navLink}
                onClick={handleSignOut} // 클릭 시 로그아웃 처리
              >
                로그아웃
              </Link>
            ) : (
              <Link
                href="/"
                style={styles.navLink}
                onClick={handleSignIn} // 클릭 시 로그아웃 처리
              >
                로그인
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '1rem',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '85%',
    margin: '0 auto',
  },
  title: {
    fontSize: '1.5rem',
    margin: '0',
  },
  navList: {
    listStyle: 'none',
    margin: '0',
    padding: '0',
    display: 'flex',
    gap: '1rem',
  },
  navListItem: {},
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'text-decoration 0.3s ease',
  },
  navButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default Navbar;
