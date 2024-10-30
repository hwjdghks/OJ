export default function Home() {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>생성 페이지</h1>
      </div>
    );
  }
  
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center', /* 수평 중앙 정렬 */
      alignItems: 'center', /* 수직 중앙 정렬 */
      height: '80vh', /* 화면 높이의 80% */
    },
    heading: {
      fontSize: '2rem', /* 제목 폰트 크기 */
      fontWeight: 'bold', /* 굵은 폰트 */
      textAlign: 'center', /* 중앙 정렬 */
    },
  };
  