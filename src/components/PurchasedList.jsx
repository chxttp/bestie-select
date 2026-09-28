// src/components/PurchasedList.jsx
import React, { useState } from 'react';
import '../styles/PurchasedList.css';

function PurchasedList({ orders, onUpdateOrder }) {
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  const uniqueBrands = ['ALL', ...new Set(orders.map((o) => o.brand).filter(Boolean))];

  // ค้นหาเฉพาะชื่อลูกค้า + กรองตามแบรนด์
  const processedOrders = orders.filter((order) => {
    const matchesCustomer = (order.customerName || '')
      .toLowerCase()
      .includes(searchCustomer.toLowerCase());

    const matchesBrand = selectedBrand === 'ALL' || order.brand === selectedBrand;

    return matchesCustomer && matchesBrand;
  });

  const totalPages = Math.ceil(processedOrders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = processedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleRevert = (id) => {
    onUpdateOrder(id, {
      purchaseStatus: 'pending',
      purchasedQuantity: 0,
    });
  };

  return (
    <div>
      <div className="buyer-controls">
        <div className="filter-group">
          <label>ค้นหาชื่อลูกค้า:</label>
          <input
            type="text"
            className="filter-input"
            placeholder="🔍 พิมพ์ชื่อลูกค้า..."
            value={searchCustomer}
            onChange={(e) => {
              setSearchCustomer(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filter-group">
          <label>กรองตามแบรนด์:</label>
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            {uniqueBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand === 'ALL' ? 'ทุกแบรนด์' : brand}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentOrders.length === 0 ? (
        <div className="empty-state">ไม่พบรายการที่ตรงกับเงื่อนไข</div>
      ) : (
        <div className="checklist-grid">
          {currentOrders.map((order) => {
            const totalQty = order.quantity || 1;

            return (
              <div key={order.id} className="order-card-purchased">
                <div>
                  <span className="card-brand-purchased">{order.brand}</span>
                  <h4 className="card-title" style={{ marginTop: '8px' }}>
                    {order.productName}
                  </h4>

                  <div className="card-info">
                    <p><strong>จำนวน:</strong> {totalQty} ชิ้น (ซื้อครบแล้ว)</p>
                    <p><strong>ลูกค้า:</strong> {order.customerName}</p>
                    <p><strong>ที่อยู่:</strong> {order.address || '-'}</p>
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <div className="status-text">✅ ซื้อเรียบร้อยแล้ว</div>
                  <button className="btn-revert" onClick={() => handleRevert(order.id)}>
                    ↩️ ย้อนกลับไปหน้ายังไม่ซื้อ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ❮ ก่อนหน้า
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            ถัดไป ❯
          </button>
        </div>
      )}
    </div>
  );
}

export default PurchasedList;