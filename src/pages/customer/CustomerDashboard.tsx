
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Package, Clock, CheckCircle, PlusCircle } from 'lucide-react';

const CustomerDashboardContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Mock user data - in a real app this would come from authentication state
  const [user] = useState({
    name: "محمد أحمد",
    email: "mohammed@example.com",
    phone: "0512345678"
  });

  const handleCreateOrder = () => {
    navigate('/customer/create-order');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">لوحة تحكم العميل</h1>
            <div>
              <span className="mr-2 text-sm text-gray-600">مرحباً، {user.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">نظرة عامة</h2>
              <Button 
                onClick={handleCreateOrder}
                className="bg-safedrop-gold hover:bg-safedrop-gold/90 gap-2"
              >
                <PlusCircle size={16} />
                طلب جديد
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-safedrop-gold" />
                    <span>إجمالي الطلبات</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">8</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-safedrop-gold" />
                    <span>قيد التوصيل</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">2</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-safedrop-gold" />
                    <span>تم توصيلها</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">6</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="active">الطلبات النشطة</TabsTrigger>
                <TabsTrigger value="history">سجل الطلبات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">الطلبات النشطة</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">من</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إلى</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السائق</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">#12348</td>
                        <td className="px-6 py-4 whitespace-nowrap">الرياض، حي الملقا</td>
                        <td className="px-6 py-4 whitespace-nowrap">الرياض، حي النخيل</td>
                        <td className="px-6 py-4 whitespace-nowrap">أحمد علي</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            قيد التوصيل
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" size="sm">تتبع</Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">#12349</td>
                        <td className="px-6 py-4 whitespace-nowrap">الرياض، حي العليا</td>
                        <td className="px-6 py-4 whitespace-nowrap">الرياض، حي الورود</td>
                        <td className="px-6 py-4 whitespace-nowrap">محمد خالد</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            بانتظار الموافقة
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" size="sm">إلغاء</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">سجل الطلبات</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">من</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إلى</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السائق</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التقييم</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">#12345</td>
                        <td className="px-6 py-4 whitespace-nowrap">2025-04-01</td>
                        <td className="px-6 py-4 whitespace-nowrap">الرياض، حي الملقا</td>
                        <td className="px-6 py-4 whitespace-nowrap">الرياض، حي النخيل</td>
                        <td className="px-6 py-4 whitespace-nowrap">أحمد علي</td>
                        <td className="px-6 py-4 whitespace-nowrap">⭐⭐⭐⭐⭐</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">#12346</td>
                        <td className="px-6 py-4 whitespace-nowrap">2025-03-25</td>
                        <td className="px-6 py-4 whitespace-nowrap">الرياض، حي العليا</td>
                        <td className="px-6 py-4 whitespace-nowrap">الرياض، حي الورود</td>
                        <td className="px-6 py-4 whitespace-nowrap">محمد خالد</td>
                        <td className="px-6 py-4 whitespace-nowrap">⭐⭐⭐⭐</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

const CustomerDashboard = () => {
  return (
    <LanguageProvider>
      <CustomerDashboardContent />
    </LanguageProvider>
  );
};

export default CustomerDashboard;
