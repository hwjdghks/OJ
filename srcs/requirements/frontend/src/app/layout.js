import './globals.css';
import Navbar from './components/Navbar';

export const metadata = {
  title: '첫 삽',
  description: '졸업 작품',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Navbar />
        <main style={styles.main}>{children}</main>
      </body>
    </html>
  );
}

const styles = {
  main: {
    padding: '20px', /* 본문 패딩 */
    fontFamily: 'Arial, sans-serif', /* 기본 폰트 설정 */
  },
};
