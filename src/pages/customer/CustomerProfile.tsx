
import React from 'react';
import CustomerSidebar from '@/components/customer/CustomerSidebar';

const CustomerProfile = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-4">الملف الشخصي</h1>
        {/* تعديل البيانات الشخصية والعنوان */}
        <form className="space-y-4 max-w-md">
          <div>
            <label htmlFor="firstName" className="block mb-1 font-semibold text-gray-700">الاسم الأول</label>
            <input id="firstName" name="firstName" type="text" className="w-full rounded border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="lastName" className="block mb-1 font-semibold text-gray-700">اسم العائلة</label>
            <input id="lastName" name="lastName" type="text" className="w-full rounded border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="address" className="block mb-1 font-semibold text-gray-700">العنوان</label>
            <textarea id="address" name="address" rows={3} className="w-full rounded border border-gray-300 px-3 py-2" />
          </div>
          <button type="submit" className="bg-safedrop-gold text-white px-4 py-2 rounded hover:bg-yellow-500">حفظ التغييرات</button>
        </form>
      </main>
    </div>
  );
};

export default CustomerProfile;
