
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { UsersIcon, TruckIcon, PackageIcon, LogOutIcon } from 'lucide-react';

const AdminDashboardContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth || adminAuth !== 'true') {
      navigate('/admin');
    } else {
      setIsAdmin(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  if (!isAdmin) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">لوحة تحكم المشرف</h1>
            <Button variant="outline" className="gap-2" onClick={handleLogout}>
              <LogOutIcon className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-safedrop-gold" />
                    <span>العملاء</span>
                  </CardTitle>
                  <CardDescription>إجمالي عدد العملاء المسجلين</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">24</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TruckIcon className="h-5 w-5 text-safedrop-gold" />
                    <span>السائقين</span>
                  </CardTitle>
                  <CardDescription>إجمالي عدد السائقين المسجلين</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">12</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-safedrop-gold" />
                    <span>الطلبات</span>
                  </CardTitle>
                  <CardDescription>إجمالي عدد الطلبات</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">57</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="drivers" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="drivers">طلبات السائقين</TabsTrigger>
                <TabsTrigger value="customers">العملاء</TabsTrigger>
                <TabsTrigger value="orders">الطلبات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="drivers" className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">طلبات انضمام السائقين</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الهوية</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تفاصيل السيارة</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">أحمد محمد</td>
                        <td className="px-6 py-4 whitespace-nowrap">1234567890</td>
                        <td className="px-6 py-4 whitespace-nowrap">تويوتا كامري 2020</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            قيد الانتظار
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2 rtl:space-x-reverse">
                            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">موافقة</Button>
                            <Button variant="destructive" size="sm">رفض</Button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">خالد عبدالله</td>
                        <td className="px-6 py-4 whitespace-nowrap">0987654321</td>
                        <td className="px-6 py-4 whitespace-nowrap">هوندا أكورد 2021</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            قيد الانتظار
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2 rtl:space-x-reverse">
                            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">موافقة</Button>
                            <Button variant="destructive" size="sm">رفض</Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="customers" className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">قائمة العملاء</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الهاتف</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عدد الطلبات</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">محمد أحمد</td>
                        <td className="px-6 py-4 whitespace-nowrap">mohammed@example.com</td>
                        <td className="px-6 py-4 whitespace-nowrap">0512345678</td>
                        <td className="px-6 py-4 whitespace-nowrap">5</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" size="sm">عرض التفاصيل</Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">سارة خالد</td>
                        <td className="px-6 py-4 whitespace-nowrap">sarah@example.com</td>
                        <td className="px-6 py-4 whitespace-nowrap">0587654321</td>
                        <td className="px-6 py-4 whitespace-nowrap">3</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" size="sm">عرض التفاصيل</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="orders" className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">قائمة الطلبات</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السائق</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">#12345</td>
                        <td className="px-6 py-4 whitespace-nowrap">محمد أحمد</td>
                        <td className="px-6 py-4 whitespace-nowrap">أحمد علي</td>
                        <td className="px-6 py-4 whitespace-nowrap">2025-04-10</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            تم التوصيل
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" size="sm">عرض التفاصيل</Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">#12346</td>
                        <td className="px-6 py-4 whitespace-nowrap">سارة خالد</td>
                        <td className="px-6 py-4 whitespace-nowrap">محمد إبراهيم</td>
                        <td className="px-6 py-4 whitespace-nowrap">2025-04-12</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            قيد التوصيل
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" size="sm">عرض التفاصيل</Button>
                        </td>
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

const AdminDashboard = () => {
  return (
    <LanguageProvider>
      <AdminDashboardContent />
    </LanguageProvider>
  );
};

export default AdminDashboard;
