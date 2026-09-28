// src/components/AdminForm.jsx
import React, { useState } from 'react';
import '../styles/AdminForm.css';

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function AdminForm({ orders, onAddOrder }) {
  const [date, setDate] = useState(getTodayDateString());
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [brand, setBrand] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [isAutoAddress, setIsAutoAddress] = useState(false);

  const handleCustomerNameChange = (e) => {
    const name = e.target.value;
    setCustomerName(name);

    const existingCustomer = orders.find(
      (o) => o.customerName && o.customerName.trim().toLowerCase() === name.trim().toLowerCase()
    );

    if (existingCustomer) {
      setAddress(existingCustomer.address || '');
      setIsAutoAddress(true);
    } else {
      setIsAutoAddress(false);
    }
  };

  const handlePaymentStatusChange = (status) => {
    const numericPrice = Number(price);
    if ((status === 'full' || status === 'deposit') && (!price || numericPrice <= 0)) {
      alert('⚠️ กรุณาระบุราคาสินค้าก่อนเลือกสถานะ "โอนครบ" หรือ "มัดจำ"');
      setPaymentStatus('unpaid');
      return;
    }
    setPaymentStatus(status);
  };

  const handlePriceChange = (val) => {
    setPrice(val);
    if (!val || Number(val) <= 0) {
      setPaymentStatus('unpaid');
      setDeposit('');
    }
  };

  const handleDepositChange = (val) => {
    const numericPrice = Number(price);
    const numericDeposit = Number(val);

    if (numericPrice > 0 && numericDeposit >= numericPrice) {
      alert('🎉 ยอดมัดจำเท่ากับราคาเต็ม ระบบจะปรับสถานะเป็น "โอนครบแล้ว"');
      setPaymentStatus('full');
      setDeposit('');
    } else {
      setDeposit(val);
    }
  };

  const totalPrice = price ? Number(price) : 0;
  const paidAmount = paymentStatus === 'full' ? totalPrice : (deposit ? Number(deposit) : 0);
  const remainingBalance = Math.max(0, totalPrice - paidAmount);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName || !brand || !productName) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const qty = Math.max(1, Number(quantity) || 1);

    onAddOrder({
      date,
      customerName,
      address,
      brand,
      productName,
      quantity: qty,
      purchasedQuantity: 0,
      price: totalPrice,
      deposit: paymentStatus === 'deposit' ? Number(deposit) : 0,
      paymentStatus,
      purchaseStatus: 'pending',
      fulfillmentStatus: 'unpacked',
      trackingNo: '',
    });

    setDate(getTodayDateString());
    setCustomerName('');
    setAddress('');
    setBrand('');
    setProductName('');
    setQuantity(1);
    setPrice('');
    setDeposit('');
    setPaymentStatus('unpaid');
    setIsAutoAddress(false);
  };

  return (
    <div className="admin-form-card">
      <h3>➕ เพิ่มรายการ Order ใหม่</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>วันที่ Order</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>
              ชื่อลูกค้า {isAutoAddress && <span className="auto-badge">(พบที่อยู่เดิม)</span>}
            </label>
            <input
              type="text"
              placeholder="พิมพ์ชื่อลูกค้า..."
              value={customerName}
              onChange={handleCustomerNameChange}
              required
            />
          </div>

          <div className="form-group">
            <label>ที่อยู่จัดส่ง</label>
            <input
              type="text"
              placeholder="กรอกที่อยู่..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>แบรนด์</label>
            <input
              type="text"
              placeholder="เช่น Gentle Woman, BAO BAO"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>ชื่อสินค้าที่ฝากหิ้ว</label>
            <input
              type="text"
              placeholder="ชื่อสินค้า/รุ่น..."
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>จำนวน (ชิ้น)</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>ราคารวมทั้งหมด (บาท)</label>
            <input
              type="number"
              placeholder="ระบุราคา..."
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>สถานะชำระเงิน</label>
            <select
              value={paymentStatus}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
            >
              <option value="unpaid">⏳ ยังไม่ชำระ</option>
              <option value="deposit">🪙 มัดจำ</option>
              <option value="full">💳 โอนครบแล้ว</option>
            </select>
          </div>

          {paymentStatus === 'deposit' && (
            <div className="form-group">
              <label>ยอดมัดจำ (บาท)</label>
              <input
                type="number"
                placeholder="ระบุยอดมัดจำ..."
                value={deposit}
                onChange={(e) => handleDepositChange(e.target.value)}
                required
              />
            </div>
          )}

          <div className="payment-summary">
            <span>ชำระแล้ว: <strong>{paidAmount.toLocaleString()} บาท</strong></span>
            <span className="remaining-text">
              เหลือชำระ: <strong>{remainingBalance.toLocaleString()} บาท</strong>
            </span>
          </div>
        </div>

        <button type="submit" className="btn-primary">บันทึก Order</button>
      </form>
    </div>
  );
}

export default AdminForm;