
import React from 'react';
import CustomerSidebar from '@/components/customer/CustomerSidebar';

const CreateOrder = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-4">طلب جديد</h1>
        {/* نموذج طلب جديد مع تحديد المواقع والتفاصيل */}
        <form className="space-y-4 max-w-xl">
          <div>
            <label htmlFor="pickup" className="block mb-1 font-semibold text-gray-700">مكان الاستلام</label>
            <input id="pickup" name="pickup" type="text" placeholder="أدخل مكان الاستلام" className="w-full rounded border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="dropoff" className="block mb-1 font-semibold text-gray-700">مكان التسليم</label>
            <input id="dropoff" name="dropoff" type="text" placeholder="أدخل مكان التسليم" className="w-full rounded border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="details" className="block mb-1 font-semibold text-gray-700">تفاصيل الطلب</label>
            <textarea id="details" name="details" rows={4} placeholder="تفاصيل إضافية" className="w-full rounded border border-gray-300 px-3 py-2" />
          </div>
          <button type="submit" className="bg-safedrop-gold text-white px-4 py-2 rounded hover:bg-yellow-500">إرسال الطلب</button>
        </form>
      </main>
    </div>
  );
};

export default CreateOrder;
