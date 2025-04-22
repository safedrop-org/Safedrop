
import React from 'react';
import CustomerSidebar from '@/components/customer/CustomerSidebar';

const MyOrders = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-4">طلباتي</h1>
        {/* هنا عرض الطلبات الحالية والسابقة مع الحالة والتفاصيل */}
        <p>لا توجد طلبات لعرضها حالياً.</p>
      </main>
    </div>
  );
};

export default MyOrders;
