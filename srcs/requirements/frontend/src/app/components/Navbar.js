// app/components/Navbar.js

import Link from 'next/link';
import styles from './Navbar.module.css';

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <h1>문제 목록</h1>
                <ul className={styles.navList}>
                    <li>
                        <Link className={styles.navLink} href="/problem-set">문제 리스트</Link>
                    </li>
                    <li>
                        <Link className={styles.navLink} href="/results">채점 결과</Link>
                    </li>
                    <li>
                        <Link className={styles.navLink} href="/message">메세지 출력</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
