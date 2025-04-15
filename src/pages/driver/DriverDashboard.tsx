
import { useState } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { Clock, CheckCircle, TruckIcon, DollarSign } from 'lucide-react';

const DriverDashboardContent = () => {
  const { t } = useLanguage();
  const [isAvailable, setIsAvailable] = useState(false);
  
  // Mock user data
  const [driver] = useState({
    name: "أحمد محمد",
    vehicle: "تويوتا كامري 2020",
    licensePlate: "ABC 1234",
    rating: 4.8
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">لوحة تحكم السائق</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">حالة الاتصال:</span>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                />
                <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                  {isAvailable ? 'متاح' : 'غير متاح'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">نظرة عامة</h2>
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <TruckIcon className="h-5 w-5 text-safedrop-gold" />
                <span>{driver.vehicle} | {driver.licensePlate}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-safedrop-gold" />
                    <span>قيد التوصيل</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">1</p>
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
                  <p className="text-3xl font-bold">24</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-safedrop-gold" />
                    <span>الإيرادات</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">2,450 ريال</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="current" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="current">الطلبات الحالية</TabsTrigger>
                <TabsTrigger value="available">طلبات متاحة</TabsTrigger>
                <TabsTrigger value="history">سجل الطلبات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">الطلبات الحالية</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">من</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إلى</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">#12350</td>
                        <td className="px-6 py-4 whitespace-nowrap">الرياض، حي الملقا</td>
                        <td className="px-6 py-4 whitespace-nowrap">الرياض، حي النخيل</td>
                        <td className="px-6 py-4 whitespace-nowrap">120 ريال</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            قيد التوصيل
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2 rtl:space-x-reverse">
                            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                              تم التوصيل
                            </Button>
                            <Button variant="outline" size="sm">الاتصال بالعميل</Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="available" className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">طلبات متاحة</h3>
                {isAvailable ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">من</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إلى</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المسافة</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">#12351</td>
                          <td className="px-6 py-4 whitespace-nowrap">الرياض، حي العليا</td>
                          <td className="px-6 py-4 whitespace-nowrap">الرياض، حي الورود</td>
                          <td className="px-6 py-4 whitespace-nowrap">15 كم</td>
                          <td className="px-6 py-4 whitespace-nowrap">110 ريال</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button variant="default" size="sm" className="bg-safedrop-gold hover:bg-safedrop-gold/90">قبول الطلب</Button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">#12352</td>
                          <td className="px-6 py-4 whitespace-nowrap">الرياض، حي الرحمانية</td>
                          <td className="px-6 py-4 whitespace-nowrap">الرياض، حي المروج</td>
                          <td className="px-6 py-4 whitespace-nowrap">8 كم</td>
                          <td className="px-6 py-4 whitespace-nowrap">75 ريال</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button variant="default" size="sm" className="bg-safedrop-gold hover:bg-safedrop-gold/90">قبول الطلب</Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded">
                    <div className="text-gray-500 mb-4">أنت حالياً غير متاح لاستقبال طلبات جديدة</div>
                    <Button onClick={() => setIsAvailable(true)} className="bg-safedrop-gold hover:bg-safedrop-gold/90">
                      تغيير الحالة إلى متاح
                    </Button>
                  </div>
                )}
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
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التقييم</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">#12345</td>
                        <td className="px-6 py-4 whitespace-nowrap">2025-04-01</td>
                        <td className="px-6 py-4 whitespace-nowrap">الرياض، حي الملقا</td>
                        <td className="px-6 py-4 whitespace-nowrap">الرياض، حي النخيل</td>
                        <td className="px-6 py-4 whitespace-nowrap">120 ريال</td>
                        <td className="px-6 py-4 whitespace-nowrap">⭐⭐⭐⭐⭐</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">#12346</td>
                        <td className="px-6 py-4 whitespace-nowrap">2025-03-25</td>
                        <td className="px-6 py-4 whitespace-nowrap">الرياض، حي العليا</td>
                        <td className="px-6 py-4 whitespace-nowrap">الرياض، حي الورود</td>
                        <td className="px-6 py-4 whitespace-nowrap">95 ريال</td>
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

const DriverDashboard = () => {
  return (
    <LanguageProvider>
      <DriverDashboardContent />
    </LanguageProvider>
  );
};

export default DriverDashboard;
