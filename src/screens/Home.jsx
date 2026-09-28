import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/Home.css'; // เช็คตัวอักษรเล็ก-ใหญ่ของชื่อไฟล์ในโฟลเดอร์ styles

function Home() {
  return (
    <div className="home-container">
      <Navbar />
      <main className="home-main">
        <h1>ยินดีต้อนรับสู่หน้าหลัก (Home Screen)</h1>
        <p>นี่คือเนื้อหาหลักของหน้า Home</p>
      </main>
    </div>
  );
}

export default Home;