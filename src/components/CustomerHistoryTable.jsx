// src/components/CustomerHistoryTable.jsx
import React, { useState } from 'react';
import '../styles/CustomerHistoryTable.css';

function CustomerHistoryTable({ orders }) {
  const [searchTerm, setSearchTerm] = useState('');

  // จัดกลุ่มข้อมูลตามชื่อลูกค้า
  const customerSummary = orders.reduce((acc, order) => {
    if (!order.customerName) return acc;
    const key = order.customerName.trim().toLowerCase();

    if (!acc[key]) {
      acc[key] = {
        name: order.customerName,
        address: order.address || '-',
        totalOrders: 0,
        totalSpent: 0,
        totalPaid: 0,
        totalRemaining: 0,
      };
    }

    const price = order.price || 0;
    let paid = 0;
    if (order.paymentStatus === 'full') {
      paid = price;
    } else if (order.paymentStatus === 'deposit') {
      paid = order.deposit || 0;
    }

    const remaining = Math.max(0, price - paid);

    acc[key].totalOrders += 1;
    acc[key].totalSpent += price;
    acc[key].totalPaid += paid;
    acc[key].totalRemaining += remaining;
    if (order.address) {
      acc[key].address = order.address; // อัปเดตที่อยู่อยู่เสมอ
    }

    return acc;
  }, {});

  const customerList = Object.values(customerSummary).filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h3>👤 สรุปประวัติลูกค้า ({customerList.length} คน)</h3>

      <input
        type="text"
        className="customer-search"
        placeholder="🔍 ค้นหาชื่อลูกค้า..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="customer-table-wrapper">
        <table className="customer-table">
          <thead>
            <tr>
              <th>ชื่อลูกค้า</th>
              <th>ที่อยู่จัดส่งล่าสุด</th>
              <th>จำนวน Order ทั้งหมด</th>
              <th>ยอดซื้อรวม (บาท)</th>
              <th>ชำระแล้ว (บาท)</th>
              <th>ค้างชำระ (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {customerList.length > 0 ? (
              customerList.map((customer, idx) => (
                <tr key={idx}>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.address}</td>
                  <td>{customer.totalOrders} รายการ</td>
                  <td>{customer.totalSpent.toLocaleString()}</td>
                  <td className="text-green">{customer.totalPaid.toLocaleString()}</td>
                  <td className={customer.totalRemaining > 0 ? 'text-red' : ''}>
                    {customer.totalRemaining.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  ไม่พบประวัติลูกค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerHistoryTable;