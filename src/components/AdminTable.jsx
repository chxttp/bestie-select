// src/components/AdminTable.jsx
import React, { useState } from 'react';
import '../styles/AdminTable.css';

function AdminTable({ orders, onUpdateOrder, onDeleteOrder }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterFulfillment, setFilterFulfillment] = useState('ALL'); // 👈 กรองสถานะจัดส่ง ย้ายมาหลังบ้านแล้ว

  const uniqueBrands = ['ALL', ...new Set(orders.map((o) => o.brand).filter(Boolean))];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.trackingNo || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBrand = filterBrand === 'ALL' || order.brand === filterBrand;
    const matchesStatus = filterStatus === 'ALL' || order.purchaseStatus === filterStatus;
    
    const currentFulfillment = order.fulfillmentStatus || 'unpacked';
    const matchesFulfillment = filterFulfillment === 'ALL' || currentFulfillment === filterFulfillment;

    return matchesSearch && matchesBrand && matchesStatus && matchesFulfillment;
  });

  const handlePriceChange = (id, newPrice) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    const val = Number(newPrice) || 0;
    const newPaymentStatus = val <= 0 ? 'unpaid' : order.paymentStatus;
    onUpdateOrder(id, { price: val, paymentStatus: newPaymentStatus });
  };

  const handleDepositChange = (id, newDeposit) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    const depVal = Number(newDeposit) || 0;
    if (order.price > 0 && depVal >= order.price) {
      alert('🎉 ยอดมัดจำเท่ากับราคาเต็ม ระบบจะปรับสถานะเป็น "โอนครบแล้ว"');
      onUpdateOrder(id, { deposit: 0, paymentStatus: 'full' });
    } else {
      onUpdateOrder(id, { deposit: depVal });
    }
  };

  const handlePaymentStatusChange = (id, newStatus) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;

    if ((newStatus === 'full' || newStatus === 'deposit') && (!order.price || order.price <= 0)) {
      alert('⚠️ กรุณาระบุราคาสินค้าก่อนเลือกสถานะ "โอนครบ" หรือ "มัดจำ"');
      return;
    }

    if (newStatus === 'deposit') {
      onUpdateOrder(id, { paymentStatus: 'deposit' });
    } else {
      // รีเซ็ตมัดจำเมื่อเปลี่ยนเป็น unpaid หรือ full
      onUpdateOrder(id, { paymentStatus: newStatus, deposit: 0 });
    }
  };

  return (
    <div className="admin-table-container">
      <div className="table-header-flex">
        <h3>📋 รายการ Order ทั้งหมด ({filteredOrders.length})</h3>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="🔍 ค้นหาชื่อลูกค้า, สินค้า, ที่อยู่, เลขพัสดุ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
        >
          {uniqueBrands.map((brand) => (
            <option key={brand} value={brand}>
              {brand === 'ALL' ? '🏷️ ทุกแบรนด์' : brand}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">🛒 ทุกสถานะซื้อ</option>
          <option value="pending">⏳ ยังไม่ซื้อ</option>
          <option value="partial">⚠️ ซื้อยังไม่ครบ</option>
          <option value="purchased">✅ ซื้อแล้ว</option>
        </select>
        
        {/* 💡 Dropdown เช็คสถานะการส่ง/แพค อยู่หลังบ้านตามความถูกต้อง */}
        <select
          className="filter-select"
          value={filterFulfillment}
          onChange={(e) => setFilterFulfillment(e.target.value)}
        >
          <option value="ALL">📦 ทุกสถานะการส่ง</option>
          <option value="unpacked">❌ ยังไม่แพ็ค</option>
          <option value="packed">🎁 แพ็คแล้ว</option>
          <option value="shipped">🚚 จัดส่งแล้ว</option>
        </select>
      </div>

      <div className="admin-table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>วันที่</th>
              <th>ชื่อลูกค้า</th>
              <th>ที่อยู่จัดส่ง</th>
              <th>แบรนด์ & สินค้า</th>
              <th>จำนวน</th>
              <th>ราคาเต็ม</th>
              <th>สถานะชำระเงิน</th>
              <th>สถานะการซื้อ</th>
              <th>สถานะแพ็ค & จัดส่ง</th>
              <th>ลบ</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">
                  ไม่พบข้อมูล Order
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const totalQty = order.quantity || 1;
                const purchasedQty = order.purchasedQuantity || (order.purchaseStatus === 'purchased' ? totalQty : 0);
                const paidAmount =
                  order.paymentStatus === 'full'
                    ? order.price || 0
                    : order.paymentStatus === 'deposit'
                    ? order.deposit || 0
                    : 0;
                const remaining = Math.max(0, (order.price || 0) - paidAmount);

                return (
                  <tr key={order.id}>
                    <td className="col-date">{order.date}</td>
                    <td className="col-customer">{order.customerName}</td>
                    <td className="col-address">{order.address || '-'}</td>
                    <td>
                      <div className="col-product">
                        <span className="brand-badge">{order.brand}</span>
                        <span className="product-name">{order.productName}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {order.purchaseStatus === 'partial' ? (
                        <span style={{ color: '#d97706' }}>{purchasedQty}/{totalQty} ชิ้น</span>
                      ) : (
                        <span>{totalQty} ชิ้น</span>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="modern-input price-input"
                        value={order.price || ''}
                        onChange={(e) => handlePriceChange(order.id, e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <select
                        className={`modern-select payment-select ${order.paymentStatus}`}
                        value={order.paymentStatus || 'unpaid'}
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                      >
                        <option value="unpaid">⏳ ยังไม่ชำระ</option>
                        <option value="deposit">🪙 มัดจำ</option>
                        <option value="full">💳 โอนครบแล้ว</option>
                      </select>

                      {order.paymentStatus === 'deposit' && (
                        <div className="deposit-card">
                          <div className="deposit-row">
                            <span>มัดจำ:</span>
                            <input
                              type="number"
                              className="modern-input deposit-input"
                              value={order.deposit || ''}
                              onChange={(e) => handleDepositChange(order.id, e.target.value)}
                            />
                          </div>
                          <div className="remaining-tag">ค้าง: {remaining.toLocaleString()}฿</div>
                        </div>
                      )}
                    </td>
                    <td>
                      <select
                        className={`modern-select status-select ${order.purchaseStatus || 'pending'}`}
                        value={order.purchaseStatus || 'pending'}
                        onChange={(e) => {
                          const status = e.target.value;
                          let pQty = purchasedQty;
                          if (status === 'purchased') pQty = totalQty;
                          if (status === 'pending') pQty = 0;
                          onUpdateOrder(order.id, { purchaseStatus: status, purchasedQuantity: pQty });
                        }}
                      >
                        <option value="pending">⏳ ยังไม่ซื้อ</option>
                        <option value="partial">⚠️ ซื้อยังไม่ครบ</option>
                        <option value="purchased">✅ ซื้อแล้ว</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className={`modern-select fulfillment-select ${order.fulfillmentStatus || 'unpacked'}`}
                        value={order.fulfillmentStatus || 'unpacked'}
                        onChange={(e) => onUpdateOrder(order.id, { fulfillmentStatus: e.target.value })}
                      >
                        <option value="unpacked">📦 ยังไม่แพค</option>
                        <option value="packed">🎁 แพคแล้ว</option>
                        <option value="shipped">🚚 จัดส่งแล้ว</option>
                      </select>

                      {order.fulfillmentStatus === 'shipped' && (
                        <div style={{ marginTop: '4px' }}>
                          <input
                            type="text"
                            className="modern-input"
                            style={{ fontSize: '11px' }}
                            placeholder="ระบุเลขพัสดุ..."
                            value={order.trackingNo || ''}
                            onChange={(e) => onUpdateOrder(order.id, { trackingNo: e.target.value })}
                          />
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-delete" onClick={() => onDeleteOrder(order.id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminTable;