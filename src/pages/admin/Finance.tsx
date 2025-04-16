
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { LogOutIcon, Download, BarChart2, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

// Define types for our data
type FinanceDataType = {
  date: string;
  totalOrders: number;
  revenue: number;
  commission: number;
  driverPayout: number;
};

const calculateFinanceSummary = (data: FinanceDataType[]) => ({
  totalRevenue: data.reduce((acc, curr) => acc + curr.revenue, 0),
  totalCommissions: data.reduce((acc, curr) => acc + curr.commission, 0),
  platformProfit: data.reduce((acc, curr) => acc + curr.commission, 0),
  driverPayouts: data.reduce((acc, curr) => acc + curr.driverPayout, 0),
  totalOrders: data.reduce((acc, curr) => acc + curr.totalOrders, 0)
});

const useFinanceData = (timeRange: string) => {
  return useQuery({
    queryKey: ['financeData', timeRange],
    queryFn: async () => {
      // In a real implementation, this would fetch data from Supabase
      // based on the timeRange parameter
      try {
        // Here we would query the database for financial data
        // const { data, error } = await supabase
        //   .from('orders')
        //   .select('price, commission_rate, driver_payout, created_at')
        //   .gte('created_at', getTimeRangeStart(timeRange))
        //   .lte('created_at', new Date().toISOString());
        
        // For now, since we don't have real data yet, return empty data
        return [] as FinanceDataType[];
        
      } catch (error) {
        console.error('Error fetching finance data:', error);
        return [] as FinanceDataType[];
      }
    }
  });
};

const FinanceContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [timeRange, setTimeRange] = useState('monthly');

  const { data: financeData = [], isLoading } = useFinanceData(timeRange);
  const summaryData = calculateFinanceSummary(financeData);

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

  const handleExportReport = () => {
    alert('تم تصدير التقرير بنجاح');
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
            <h1 className="text-xl font-bold text-gray-900">الملخص المالي</h1>
            <Button variant="outline" className="gap-2" onClick={handleLogout}>
              <LogOutIcon className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="اختر الفترة الزمنية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">يومي</SelectItem>
                    <SelectItem value="monthly">شهري</SelectItem>
                    <SelectItem value="yearly">سنوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleExportReport}
              >
                <Download className="h-4 w-4" />
                تصدير التقرير
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-t-4 border-t-safedrop-gold">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">إجمالي المبالغ المستلمة</p>
                      <h3 className="text-2xl font-bold">{summaryData.totalRevenue} ريال</h3>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">إجمالي العمولات (15%)</p>
                      <h3 className="text-2xl font-bold">{summaryData.totalCommissions} ريال</h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">أرباح المنصة</p>
                      <h3 className="text-2xl font-bold">{summaryData.platformProfit} ريال</h3>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <BarChart2 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-purple-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">مستحقات السائقين</p>
                      <h3 className="text-2xl font-bold">{summaryData.driverPayouts} ريال</h3>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="revenue" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
                <TabsTrigger value="orders">الطلبات</TabsTrigger>
                <TabsTrigger value="comparison">مقارنة</TabsTrigger>
              </TabsList>
              
              {isLoading ? (
                <div className="flex justify-center items-center p-12">
                  <p>جاري تحميل البيانات...</p>
                </div>
              ) : financeData.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <BarChart2 className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">لا توجد بيانات مالية متاحة حاليًا</p>
                  </div>
                </div>
              ) : (
                <>
                  <TabsContent value="revenue" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>تحليل الإيرادات</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={financeData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="revenue" name="إجمالي الإيرادات" stroke="#FFD700" strokeWidth={2} activeDot={{ r: 8 }} />
                              <Line type="monotone" dataKey="commission" name="العمولات" stroke="#82ca9d" />
                              <Line type="monotone" dataKey="driverPayout" name="مستحقات السائقين" stroke="#8884d8" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="orders" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>تحليل الطلبات</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={financeData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="totalOrders" name="عدد الطلبات" fill="#1c4e80" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="comparison" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>مقارنة الإيرادات والمدفوعات</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={financeData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="revenue" name="الإيرادات" fill="#FFD700" />
                              <Bar dataKey="commission" name="العمولات" fill="#82ca9d" />
                              <Bar dataKey="driverPayout" name="مدفوعات السائقين" fill="#8884d8" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </>
              )}
            </Tabs>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>تفاصيل المعاملات المالية</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {financeData.length === 0 ? (
                  <div className="text-center p-6">
                    <p className="text-gray-500">لا توجد معاملات مالية لعرضها</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-xs uppercase">
                        <tr>
                          <th className="px-6 py-3 text-right font-medium text-gray-500">التاريخ</th>
                          <th className="px-6 py-3 text-right font-medium text-gray-500">عدد الطلبات</th>
                          <th className="px-6 py-3 text-right font-medium text-gray-500">إجمالي الإيرادات</th>
                          <th className="px-6 py-3 text-right font-medium text-gray-500">العمولات (15%)</th>
                          <th className="px-6 py-3 text-right font-medium text-gray-500">مستحقات السائقين</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {financeData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{item.totalOrders}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{item.revenue} ريال</td>
                            <td className="px-6 py-4 whitespace-nowrap">{item.commission} ريال</td>
                            <td className="px-6 py-4 whitespace-nowrap">{item.driverPayout} ريال</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 font-medium">
                        <tr>
                          <td className="px-6 py-3 text-right">المجموع</td>
                          <td className="px-6 py-3 text-right">{summaryData.totalOrders}</td>
                          <td className="px-6 py-3 text-right">{summaryData.totalRevenue} ريال</td>
                          <td className="px-6 py-3 text-right">{summaryData.totalCommissions} ريال</td>
                          <td className="px-6 py-3 text-right">{summaryData.driverPayouts} ريال</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

// Wrap the component with LanguageProvider
const Finance = () => {
  return (
    <LanguageProvider>
      <FinanceContent />
    </LanguageProvider>
  );
};

export default Finance;
