// src/App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminScreen from './screens/AdminScreen';
import BuyerScreen from './screens/BuyerScreen';

import { db } from './firebase';
import { 
  collection, 
  onSnapshot, // 🟢 เปลี่ยนมาใช้ onSnapshot สำหรับ Realtime
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore';


function App() {
  const [activeView, setActiveView] = useState('admin');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 ใช้ useEffect + onSnapshot เพื่อฟังการเปลี่ยนแปลงของข้อมูลตลอดเวลา (Realtime Sync)
  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    // เรียงลำดับรายการตามเวลาที่สร้าง (ล่าสุดอยู่บน)
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setOrders(fetchedOrders); // อัปเดต State ทันทีที่ Firestore เปลี่ยนแปลง
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    );

    // Clean up listener เมื่อ unmount
    return () => unsubscribe();
  }, []);

  // ➕ ฟังก์ชันเพิ่ม Order
  const handleAddOrder = async (newOrderData) => {
    try {
      await addDoc(collection(db, 'orders'), {
        ...newOrderData,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      // ไม่ต้องเขียน setOrders เองแล้ว เพราะ onSnapshot จะทำงานและอัปเดตหน้าให้อัตโนมัติทันที
    } catch (error) {
      console.error('Error adding order:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก Order');
    }
  };

  // ✏️ ฟังก์ชันอัปเดต Order
  const handleUpdateOrder = async (orderId, updatedFields) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, updatedFields);
      // onSnapshot จะทำงานและอัปเดต UI ทันทีโดยไม่ต้อง Refresh
    } catch (error) {
      console.error('Error updating order:', error);
      alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    }
  };

  // 🗑️ ฟังก์ชันลบ Order
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  return (
    <div>
      <Navbar activeView={activeView} setActiveView={setActiveView} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
          ⏳ กำลังเชื่อมต่อข้อมูล Realtime...
        </div>
      ) : activeView === 'admin' ? (
        <AdminScreen
          orders={orders}
          onAddOrder={handleAddOrder}
          onUpdateOrder={handleUpdateOrder}
          onDeleteOrder={handleDeleteOrder}
        />
      ) : (
        <BuyerScreen orders={orders} onUpdateOrder={handleUpdateOrder} />
      )}
    </div>
  );
}

export default App;