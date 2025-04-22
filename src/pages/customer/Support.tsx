
import React from 'react';
import CustomerSidebar from '@/components/customer/CustomerSidebar';

const Support = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-4">الدعم الفني</h1>
        {/* فتح ومتابعة التذاكر أو التواصل مع الدعم */}
        <p>لم يتم إضافة نظام التذاكر بعد.</p>
      </main>
    </div>
  );
};

export default Support;
