// src/screens/AdminScreen.jsx
import React, { useState } from 'react';
import AdminForm from '../components/AdminForm';
import AdminTable from '../components/AdminTable';
import CustomerHistoryTable from '../components/CustomerHistoryTable';
import '../styles/AdminScreen.css';

function AdminScreen({ orders, onAddOrder, onUpdateOrder, onDeleteOrder }) {
  const [activeTab, setActiveTab] = useState('orders'); // orders | customers

  return (
    <div className="admin-container">
      <h2>🔴 Admin </h2>

      <div className="admin-subtabs">
        <button
          className={`subtab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 จัดการ Order & เพิ่มสินค้า
        </button>
        <button
          className={`subtab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          👤 ประวัติ & สรุปยอดลูกค้า
        </button>
      </div>

      {activeTab === 'orders' ? (
        <>
          <AdminForm orders={orders} onAddOrder={onAddOrder} />
          <AdminTable 
            orders={orders} 
            onUpdateOrder={onUpdateOrder} 
            onDeleteOrder={onDeleteOrder} 
          />
        </>
      ) : (
        <CustomerHistoryTable orders={orders} />
      )}
    </div>
  );
}

export default AdminScreen;