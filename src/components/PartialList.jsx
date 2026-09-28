// src/components/PartialList.jsx
import React, { useState, useEffect } from 'react';
import '../styles/PartialList.css';

// 💡 Component ย่อยสำหรับแต่ละการ์ด เพื่อให้พิมพ์ตัวเลขได้อย่างอิสระ ไม่เด้งหนีระหว่างพิมพ์
function PartialCard({ order, onUpdateOrder }) {
  const totalQty = Number(order.quantity) || 1;
  const currentPurchased = Number(order.purchasedQuantity) || 1;

  // สร้าง State สำหรับเก็บค่าที่กำลังพิมพ์ในช่อง Input แยกต่างหาก
  const [inputValue, setInputValue] = useState(currentPurchased);

  // อัปเดตค่าในช่องพิมพ์เมื่อข้อมูลภายนอกเปลี่ยน
  useEffect(() => {
    setInputValue(currentPurchased);
  }, [currentPurchased]);

  // ฟังก์ชันคำนวณและส่งค่าอัปเดตไปยังตัวแม่
  const applyQuantityUpdate = (val) => {
    let targetQty = parseInt(val, 10);

    // ถ้าพิมพ์ค่าว่าง หรือไม่ใช่ตัวเลข ให้ดึงค่าเดิมกลับมา
    if (isNaN(targetQty)) {
      setInputValue(currentPurchased);
      return;
    }

    // กรณีที่ 1: พิมพ์จำนวนเท่ากับหรือมากกว่าจำนวนเต็มที่สั่ง -> ไปหน้าซื้อแล้ว
    if (targetQty >= totalQty) {
      onUpdateOrder(order.id, {
        purchaseStatus: 'purchased',
        purchasedQuantity: totalQty,
      });
      return;
    }

    // กรณีที่ 2: พิมพ์เลข 0 หรือติดลบ -> กลับไปหน้ายังไม่ซื้อ
    if (targetQty <= 0) {
      onUpdateOrder(order.id, {
        purchaseStatus: 'pending',
        purchasedQuantity: 0,
      });
      return;
    }

    // กรณีที่ 3: พิมพ์จำนวนระหว่าง 1 ถึง (totalQty - 1) -> ยืนยันให้อยู่หน้าซื้อยังไม่ครบ
    onUpdateOrder(order.id, {
      purchaseStatus: 'partial',
      purchasedQuantity: targetQty,
    });
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value); // อนุญาตให้พิมพ์/ลบ ได้ตามสบาย ไม่เพิ่งคำนวณย้ายหน้า
  };

  const handleBlur = () => {
    applyQuantityUpdate(inputValue); // คำนวณย้ายหน้าเฉพาะตอนพิมพ์เสร็จแล้วคลิกข้างนอก
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyQuantityUpdate(inputValue); // คำนวณย้ายหน้าเมื่อกด Enter
    }
  };

  return (
    <div className="order-card-partial">
      <div>
        <span className="card-brand-partial">{order.brand}</span>
        <h4 className="card-title" style={{ marginTop: '8px' }}>
          {order.productName}
        </h4>

        <div className="card-info">
          <p><strong>ลูกค้า:</strong> {order.customerName}</p>
          <p><strong>ที่อยู่:</strong> {order.address || '-'}</p>
          <p><strong>จำนวนที่สั่งทั้งหมด:</strong> {totalQty} ชิ้น</p>
        </div>
      </div>

      <div className="qty-control-box" style={{ marginTop: '12px' }}>
        <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
          จำนวนที่ซื้อได้แล้วตอนนี้:
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
          <button
            className="btn-qty"
            onClick={() => applyQuantityUpdate(currentPurchased - 1)}
          >
            ➖
          </button>

          <input
            type="number"
            className="qty-input"
            value={inputValue}
            min="0"
            max={totalQty}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />

          <span style={{ fontWeight: 'bold' }}>/ {totalQty} ชิ้น</span>

          <button
            className="btn-qty"
            onClick={() => applyQuantityUpdate(currentPurchased + 1)}
          >
            ➕
          </button>
        </div>
      </div>
    </div>
  );
}

function PartialList({ orders, onUpdateOrder }) {
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  const uniqueBrands = ['ALL', ...new Set(orders.map((o) => o.brand).filter(Boolean))];

  const partialOrders = orders.filter((o) => o.purchaseStatus === 'partial');

  const processedOrders = partialOrders.filter((order) => {
    const matchesCustomer = (order.customerName || '')
      .toLowerCase()
      .includes(searchCustomer.toLowerCase());

    const matchesBrand = selectedBrand === 'ALL' || order.brand === selectedBrand;

    return matchesCustomer && matchesBrand;
  });

  const totalPages = Math.ceil(processedOrders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = processedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
        <div className="empty-state">ไม่พบรายการสินค้าที่ซื้อยังไม่ครบ</div>
      ) : (
        <div className="checklist-grid">
          {currentOrders.map((order) => (
            <PartialCard
              key={order.id}
              order={order}
              onUpdateOrder={onUpdateOrder}
            />
          ))}
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

export default PartialList;