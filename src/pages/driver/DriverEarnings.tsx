
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'السبت', amount: 400 },
  { name: 'الأحد', amount: 600 },
  { name: 'الاثنين', amount: 500 },
  { name: 'الثلاثاء', amount: 700 },
  { name: 'الأربعاء', amount: 800 },
  { name: 'الخميس', amount: 1000 },
  { name: 'الجمعة', amount: 900 },
];

const DriverEarningsContent = () => {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">الأرباح</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">الأرباح اليوم</p>
                      <p className="text-2xl font-bold mt-1">900 ريال</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4 text-green-600">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="text-sm mr-1">15% زيادة عن أمس</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">الأرباح هذا الأسبوع</p>
                      <p className="text-2xl font-bold mt-1">4,900 ريال</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4 text-blue-600">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="text-sm mr-1">10% زيادة عن الأسبوع الماضي</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">الأرباح هذا الشهر</p>
                      <p className="text-2xl font-bold mt-1">19,200 ريال</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4 text-purple-600">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="text-sm mr-1">20% زيادة عن الشهر الماضي</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>تحليل الأرباح</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>آخر المعاملات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border-b last:border-0">
                      <div>
                        <p className="font-medium">طلب #{1234 + index}</p>
                        <p className="text-sm text-gray-500">اليوم 10:30 ص</p>
                      </div>
                      <span className="text-green-600 font-medium">+150 ريال</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverEarnings = () => {
  return (
    <LanguageProvider>
      <DriverEarningsContent />
    </LanguageProvider>
  );
};

export default DriverEarnings;
