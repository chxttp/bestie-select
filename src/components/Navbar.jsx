// src/components/Navbar.jsx
import React from 'react';
import logoImg from '../images/Bestie-select-logo.png'; // 👈 นำเข้าโลโก้จากโฟลเดอร์ image
import '../styles/Navbar.css';

function Navbar({ activeView, setActiveView }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img 
          src={logoImg} 
          alt="Bestie Select Logo" 
          className="navbar-logo" 
        />
        <div className="brand-text-group">
          <span className="brand-title">BESTIE SELECT</span>
          <span className="brand-subtitle">Personal Shopper Management</span>
        </div>
      </div>

      <div className="btn-group">
        <button
          className={`nav-btn ${activeView === 'admin' ? 'active-admin' : ''}`}
          onClick={() => setActiveView('admin')}
        >
          <span className="dot admin-dot"></span>
          ฝั่งแอดมิน
        </button>
        <button
          className={`nav-btn ${activeView === 'buyer' ? 'active-buyer' : ''}`}
          onClick={() => setActiveView('buyer')}
        >
          <span className="dot buyer-dot"></span>
          ฝั่งหน้างาน (คนหิ้ว)
        </button>
      </div>
    </nav>
  );
}

export default Navbar;