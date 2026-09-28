// src/components/BuyerChecklist.jsx
import React, { useState } from 'react';
import '../styles/BuyerChecklist.css';

function BuyerChecklist({ orders, onUpdateOrder }) {
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // State สำหรับควบคุม Pop-up / Modal การซื้อยังไม่ครบ
  const [partialModalOrder, setPartialModalOrder] = useState(null);
  const [boughtQtyInput, setBoughtQtyInput] = useState(1);

  const ITEMS_PER_PAGE = 6;

  // ดึงแบรนด์ทั้งหมดแบบไม่ซ้ำ
  const uniqueBrands = ['ALL', ...new Set(orders.map((o) => o.brand).filter(Boolean))];

  // กรองสินค้าเฉพาะสถานะ 'pending' (ยังไม่ได้ซื้อ)
  const pendingOrders = orders.filter((o) => (o.purchaseStatus || 'pending') === 'pending');

  const processedOrders = pendingOrders.filter((order) => {
    const matchesCustomer = (order.customerName || '')
      .toLowerCase()
      .includes(searchCustomer.toLowerCase());

    const matchesBrand = selectedBrand === 'ALL' || order.brand === selectedBrand;

    return matchesCustomer && matchesBrand;
  });

  const totalPages = Math.ceil(processedOrders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = processedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // กดซื้อครบแล้ว
  const handleBuyFull = (order) => {
    const totalQty = Number(order.quantity) || 1;
    onUpdateOrder(order.id, {
      purchaseStatus: 'purchased',
      purchasedQuantity: totalQty,
    });
  };

  // เปิด Modal เพื่อระบุจำนวนที่ซื้อได้
  const openPartialModal = (order) => {
    setPartialModalOrder(order);
    setBoughtQtyInput(1); // ค่าเริ่มต้นคือ 1 ชิ้น
  };

  // บันทึกผลการซื้อยังไม่ครบจาก Modal
  const handleSavePartial = () => {
    if (!partialModalOrder) return;

    const totalQty = Number(partialModalOrder.quantity) || 1;
    const boughtQty = Math.min(Math.max(Number(boughtQtyInput) || 0, 0), totalQty);

    if (boughtQty >= totalQty) {
      onUpdateOrder(partialModalOrder.id, {
        purchaseStatus: 'purchased',
        purchasedQuantity: totalQty,
      });
    } else {
      onUpdateOrder(partialModalOrder.id, {
        purchaseStatus: 'partial',
        purchasedQuantity: boughtQty,
      });
    }

    setPartialModalOrder(null);
  };

  return (
    <div className="buyer-checklist-container">
      {/* ส่วนแถบค้นหาและกรอง */}
      <div className="buyer-controls">
        <div className="filter-group">
          <label>ค้นหาลูกค้า:</label>
          <div className="input-with-icon">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="filter-input"
              placeholder="พิมพ์ชื่อลูกค้า..."
              value={searchCustomer}
              onChange={(e) => {
                setSearchCustomer(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
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

      {/* ส่วนการ์ดรายการสินค้า */}
      {currentOrders.length === 0 ? (
        <div className="empty-state">
          <p>🎉 ไม่พบรายการที่ต้องไปซื้อในขณะนี้</p>
        </div>
      ) : (
        <div className="checklist-grid">
          {currentOrders.map((order) => {
            const totalQty = Number(order.quantity) || 1;

            return (
              <div key={order.id} className="order-card-pending">
                <div className="card-top">
                  <span className="card-brand-tag">{order.brand || 'Unbranded'}</span>
                  <h3 className="card-product-title">{order.productName}</h3>

                  <div className="card-details">
                    <div className="detail-row">
                      <span className="detail-label">จำนวนสั่ง:</span>
                      <span className="detail-value qty-badge">{totalQty} ชิ้น</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">ลูกค้า:</span>
                      <span className="detail-value">{order.customerName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">ที่อยู่จัดส่ง:</span>
                      <span className="detail-value address-text">{order.address || '-'}</span>
                    </div>
                    {order.date && (
                      <div className="detail-row">
                        <span className="detail-label">วันที่สั่ง:</span>
                        <span className="detail-value date-text">{order.date}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ปุ่มควบคุมการซื้อ */}
                <div className="card-actions">
                  <button
                    type="button"
                    className="btn-buy-full"
                    onClick={() => handleBuyFull(order)}
                  >
                    ✅ ซื้อแล้ว (ครบ {totalQty} ชิ้น)
                  </button>
                  <button
                    type="button"
                    className="btn-buy-partial"
                    onClick={() => openPartialModal(order)}
                  >
                    ⚠️ ซื้อยังไม่ครบ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            type="button"
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ❮ ก่อนหน้า
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            ถัดไป ❯
          </button>
        </div>
      )}

      {/* Pop-up Modal ลอยทับหน้าจอเมื่อกดซื้อยังไม่ครบ */}
      {partialModalOrder && (
        <div className="modal-overlay" onClick={() => setPartialModalOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ ระบุจำนวนที่ซื้อได้จริง</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setPartialModalOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-product-name">{partialModalOrder.productName}</p>
              <p className="modal-info-text">
                จำนวนที่ลูกค้าสั่งทั้งหมด: <strong>{partialModalOrder.quantity || 1} ชิ้น</strong>
              </p>

              <div className="modal-input-group">
                <label>ซื้อได้กี่ชิ้นแล้ว?</label>
                <div className="qty-counter-input">
                  <button
                    type="button"
                    onClick={() => setBoughtQtyInput((prev) => Math.max(0, prev - 1))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    max={partialModalOrder.quantity || 1}
                    value={boughtQtyInput}
                    onChange={(e) => setBoughtQtyInput(Number(e.target.value))}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setBoughtQtyInput((prev) =>
                        Math.min(Number(partialModalOrder.quantity) || 1, prev + 1)
                      )
                    }
                  >
                    +
                  </button>
                </div>
                <span className="input-hint">
                  (ขาดอีก {(Number(partialModalOrder.quantity) || 1) - boughtQtyInput} ชิ้น)
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setPartialModalOrder(null)}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className="btn-confirm-save"
                onClick={handleSavePartial}
              >
                บันทึกสถานะ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerChecklist;