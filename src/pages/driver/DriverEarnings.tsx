import { useState } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, Clock, Download, Calendar } from 'lucide-react';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const DriverEarningsContent = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">الأرباح</h1>
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>تصدير التقرير</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="details">تفاصيل الأرباح</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>ملخص الأرباح</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600">إجمالي الأرباح</p>
                        <p className="font-medium">5,250 ر.س</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600">عمولة المنصة (15%)</p>
                        <p className="font-medium">787.50 ر.س</p>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex items-center justify-between font-medium">
                          <p>الرصيد المتاح</p>
                          <p>4,462.50 ر.س</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>المدفوعات المعلقة</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">لا توجد مدفوعات معلقة حالياً</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      <span>سجل الأرباح</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full leading-normal">
                        <thead>
                          <tr>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              تاريخ الطلب
                            </th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              رقم الطلب
                            </th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              المبلغ
                            </th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              الحالة
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-5 py-5 border-b text-sm">
                              2024-07-15
                            </td>
                            <td className="px-5 py-5 border-b text-sm">
                              #12345
                            </td>
                            <td className="px-5 py-5 border-b text-sm">
                              50 ر.س
                            </td>
                            <td className="px-5 py-5 border-b text-sm">
                              تم الدفع
                            </td>
                          </tr>
                          <tr>
                            <td className="px-5 py-5 border-b text-sm">
                              2024-07-14
                            </td>
                            <td className="px-5 py-5 border-b text-sm">
                              #12344
                            </td>
                            <td className="px-5 py-5 border-b text-sm">
                              75 ر.س
                            </td>
                            <td className="px-5 py-5 border-b text-sm">
                              تم الدفع
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverEarnings = () => {
  return (
    <LanguageProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <DriverEarningsContent />
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
};

export default DriverEarnings;
