import Link from 'next/link';

export default function Home() {
  return (
    <div style={styles.container}>
      <div style={styles.linkContainer}>
        <Link href="/problem-set" style={styles.link}>
          문제 리스트
        </Link>
        <Link href="/results" style={styles.link}>
          채점 현황
        </Link>
        <Link href="/status" style={styles.link}>
          내 제출 현황
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '80vh',
  },
  linkContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  link: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    backgroundColor: '#ecf0f1',
    transition: 'background-color 0.3s ease',
  },
};
