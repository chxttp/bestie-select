// src/screens/BuyerScreen.jsx
import React, { useState } from 'react';
import BuyerChecklist from '../components/BuyerChecklist';
import PartialList from '../components/PartialList';
import PurchasedList from '../components/PurchasedList';
import '../styles/BuyerScreen.css';

function BuyerScreen({ orders, onUpdateOrder }) {
  const [activeTab, setActiveTab] = useState('pending');

  const pendingOrders = orders.filter(
    (o) => !o.purchaseStatus || o.purchaseStatus === 'pending'
  );

  const partialOrders = orders.filter(
    (o) => o.purchaseStatus === 'partial'
  );

  const purchasedOrders = orders.filter(
    (o) => o.purchaseStatus === 'purchased'
  );

  return (
    <div className="buyer-container">
      <h2>🛍️ ระบบจัดการซื้อสินค้าหน้างาน</h2>

      <div className="buyer-tabs">
        <button
          className={`buyer-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          🛒 รายการที่ต้องไปซื้อ ({pendingOrders.length})
        </button>
        <button
          className={`buyer-tab-btn partial-tab ${activeTab === 'partial' ? 'active' : ''}`}
          onClick={() => setActiveTab('partial')}
        >
          ⚠️ ซื้อยังไม่ครบ ({partialOrders.length})
        </button>
        <button 
          className={`buyer-tab-btn purchased-tab ${activeTab === 'purchased' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchased')}
        >
          ✅ ซื้อเรียบร้อยแล้ว ({purchasedOrders.length})
        </button>
      </div>

      <div className="buyer-tab-content">
        {activeTab === 'pending' && (
          <BuyerChecklist orders={pendingOrders} onUpdateOrder={onUpdateOrder} />
        )}
        {activeTab === 'partial' && (
          <PartialList orders={partialOrders} onUpdateOrder={onUpdateOrder} />
        )}
        {activeTab === 'purchased' && (
          <PurchasedList orders={purchasedOrders} onUpdateOrder={onUpdateOrder} />
        )}
      </div>
    </div>
  );
}

export default BuyerScreen;