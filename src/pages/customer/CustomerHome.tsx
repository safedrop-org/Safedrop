
import React from 'react';
import CustomerSidebar from '@/components/customer/CustomerSidebar';

const CustomerHome = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-4">الصفحة الرئيسية</h1>
        <p>مرحبًا بك في لوحة تحكم العميل.</p>
        {/* يمكن إضافة مكونات تلخيص الحساب وحالة آخر طلب */}
      </main>
    </div>
  );
};

export default CustomerHome;
