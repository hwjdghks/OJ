import Link from 'next/link';

const Navbar = () => {
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
        </ul>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#2c3e50', /* Dark blue-gray background */
    color: 'white', /* White text color */
    padding: '1rem', /* Padding for the navbar */
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between', /* Align items at the ends */
    alignItems: 'center', /* Vertically center items */
    maxWidth: '1200px', /* Maximum width for the container */
    margin: '0 auto', /* Center the container */
  },
  title: {
    fontSize: '1.5rem', /* Font size for the title */
    margin: '0', /* Remove default margin */
  },
  navList: {
    listStyle: 'none', /* Remove default list styling */
    margin: '0', /* Remove default margin */
    padding: '0', /* Remove default padding */
    display: 'flex', /* Display list items in a row */
    gap: '1rem', /* Space between list items */
  },
  navListItem: {
    /* Additional styles for list items can be added here */
  },
  navLink: {
    color: 'white', /* White text color for links */
    textDecoration: 'none', /* Remove underline from links */
    fontWeight: 'bold', /* Bold text for links */
    transition: 'text-decoration 0.3s ease', /* Smooth underline transition */
  },
  navLinkHover: {
    textDecoration: 'underline', /* Underline on hover */
  },
};

export default Navbar;
