
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminSidebar from '@/components/admin/AdminSidebar';
import { LogOutIcon, Download, BarChart2, DollarSign, Calendar } from 'lucide-react';
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
type MonthlyDataType = {
  month: string;
  totalOrders: number;
  revenue: number;
  commission: number;
  driverPayout: number;
};

type DailyDataType = {
  date: string;
  totalOrders: number;
  revenue: number;
  commission: number;
  driverPayout: number;
};

// Union type for chart data
type ChartDataType = MonthlyDataType | DailyDataType;

const mockMonthlyData: MonthlyDataType[] = [
  { month: 'يناير', totalOrders: 120, revenue: 24000, commission: 3600, driverPayout: 20400 },
  { month: 'فبراير', totalOrders: 150, revenue: 30000, commission: 4500, driverPayout: 25500 },
  { month: 'مارس', totalOrders: 180, revenue: 36000, commission: 5400, driverPayout: 30600 },
  { month: 'أبريل', totalOrders: 200, revenue: 40000, commission: 6000, driverPayout: 34000 }
];

const mockDailyData: DailyDataType[] = [
  { date: '2025-04-10', totalOrders: 42, revenue: 8400, commission: 1260, driverPayout: 7140 },
  { date: '2025-04-11', totalOrders: 38, revenue: 7600, commission: 1140, driverPayout: 6460 },
  { date: '2025-04-12', totalOrders: 45, revenue: 9000, commission: 1350, driverPayout: 7650 },
  { date: '2025-04-13', totalOrders: 52, revenue: 10400, commission: 1560, driverPayout: 8840 },
  { date: '2025-04-14', totalOrders: 48, revenue: 9600, commission: 1440, driverPayout: 8160 },
  { date: '2025-04-15', totalOrders: 50, revenue: 10000, commission: 1500, driverPayout: 8500 },
  { date: '2025-04-16', totalOrders: 55, revenue: 11000, commission: 1650, driverPayout: 9350 }
];

// Create a utility function to adapt daily data to monthly data format
const adaptDailyDataToMonthlyFormat = (dailyData: DailyDataType[]): (MonthlyDataType & { date: string })[] => {
  return dailyData.map(item => ({
    month: '',  // This will be unused but needed for type safety
    date: item.date,
    totalOrders: item.totalOrders,
    revenue: item.revenue,
    commission: item.commission,
    driverPayout: item.driverPayout
  }));
};

const FinanceContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [timeRange, setTimeRange] = useState('monthly');
  const [chartData, setChartData] = useState<MonthlyDataType[]>(mockMonthlyData);

  const summaryData = {
    totalRevenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
    totalCommissions: chartData.reduce((acc, curr) => acc + curr.commission, 0),
    platformProfit: chartData.reduce((acc, curr) => acc + curr.commission, 0),
    driverPayouts: chartData.reduce((acc, curr) => acc + curr.driverPayout, 0),
    totalOrders: chartData.reduce((acc, curr) => acc + curr.totalOrders, 0)
  };

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth || adminAuth !== 'true') {
      navigate('/admin');
    } else {
      setIsAdmin(true);
    }
  }, [navigate]);

  useEffect(() => {
    // Update chart data based on timeRange
    if (timeRange === 'daily') {
      setChartData(adaptDailyDataToMonthlyFormat(mockDailyData));
    } else {
      setChartData(mockMonthlyData);
    }
  }, [timeRange]);

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
              
              <TabsContent value="revenue" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>تحليل الإيرادات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={timeRange === 'daily' ? 'date' : 'month'} />
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
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={timeRange === 'daily' ? 'date' : 'month'} />
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
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={timeRange === 'daily' ? 'date' : 'month'} />
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
            </Tabs>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>تفاصيل المعاملات المالية</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs uppercase">
                      <tr>
                        <th className="px-6 py-3 text-right font-medium text-gray-500">{timeRange === 'daily' ? 'التاريخ' : 'الشهر'}</th>
                        <th className="px-6 py-3 text-right font-medium text-gray-500">عدد الطلبات</th>
                        <th className="px-6 py-3 text-right font-medium text-gray-500">إجمالي الإيرادات</th>
                        <th className="px-6 py-3 text-right font-medium text-gray-500">العمولات (15%)</th>
                        <th className="px-6 py-3 text-right font-medium text-gray-500">مستحقات السائقين</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {chartData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">{timeRange === 'daily' ? (item as any).date : item.month}</td>
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
