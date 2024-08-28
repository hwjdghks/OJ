import './globals.css';
import ClientWrapper from './components/ClientWrapper';

export const metadata = {
  title: '첫 삽',
  description: '졸업 작품',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={styles.body}>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}

const styles = {
  body: {
    margin: '0px'
  },
  main: {
    padding: '20px', /* 본문 패딩 */
    fontFamily: 'Arial, sans-serif', /* 기본 폰트 설정 */
  },
};
