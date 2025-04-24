
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, DollarSign, Users, Truck, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// مكون البطاقة المالية
const StatCard = ({ title, value, icon, description, textColor = "text-gray-600" }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`${textColor} rounded-full p-2 bg-gray-100`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </CardContent>
  </Card>
);

const Finance = () => {
  const [timeRange, setTimeRange] = useState("شهري");
  
  // بيانات مالية تجريبية - يمكن استبدالها بالبيانات الفعلية من قاعدة البيانات
  const financialData = {
    totalRevenue: "145,250 ر.س",
    commissions: "21,787 ر.س",
    platformProfit: "18,350 ر.س",
    driverProfit: "123,463 ر.س",
    dailyChart: [],
    monthlyChart: [],
    yearlyChart: []
  };

  return (
    <div className="p-6 flex flex-col min-h-svh">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">الملخص المالي</h1>
        <div className="flex items-center gap-3">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="يومي">يومي</SelectItem>
              <SelectItem value="شهري">شهري</SelectItem>
              <SelectItem value="سنوي">سنوي</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            تصدير التقرير
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="إجمالي المبالغ المستلمة"
          value={financialData.totalRevenue}
          icon={<DollarSign size={20} />}
          description={`${timeRange}`}
          textColor="text-green-600"
        />
        <StatCard
          title="إجمالي العمولات (15٪)"
          value={financialData.commissions}
          icon={<TrendingUp size={20} />}
          description={`${timeRange}`}
          textColor="text-blue-600"
        />
        <StatCard
          title="أرباح المنصة"
          value={financialData.platformProfit}
          icon={<DollarSign size={20} />}
          description={`${timeRange}`}
          textColor="text-purple-600"
        />
        <StatCard
          title="الأرباح المستحقة للسائقين"
          value={financialData.driverProfit}
          icon={<Truck size={20} />}
          description={`${timeRange}`}
          textColor="text-orange-600"
        />
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="daily">تقرير يومي</TabsTrigger>
          <TabsTrigger value="monthly">تقرير شهري</TabsTrigger>
          <TabsTrigger value="annual">تقرير سنوي</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>التقرير اليومي</CardTitle>
              <CardDescription>مخطط الإيرادات والأرباح اليومية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-gray-500">سيتم عرض الرسم البياني اليومي هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>التقرير الشهري</CardTitle>
              <CardDescription>مخطط الإيرادات والأرباح الشهرية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-gray-500">سيتم عرض الرسم البياني الشهري هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="annual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>التقرير السنوي</CardTitle>
              <CardDescription>مخطط الإيرادات والأرباح السنوية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-gray-500">سيتم عرض الرسم البياني السنوي هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
