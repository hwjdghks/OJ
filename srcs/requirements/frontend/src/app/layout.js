import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "첫 삽",
  description: "졸업 작품",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Navbar />
        <main>{children}</main>
        </body>
    </html>
  );
}
