
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
  const [timeRange, setTimeRange] = useState("monthly");
  
  // استخدام React Query لجلب البيانات المالية من قاعدة البيانات
  const { data: financialData, isLoading } = useQuery({
    queryKey: ["financial-summary", timeRange],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_financial_summary', {
          period_type: timeRange
        });
        
        if (error) throw error;
        return data || {
          total_revenue: 0,
          commissions: 0,
          platform_profit: 0,
          driver_profit: 0
        };
      } catch (error) {
        console.error('Error fetching financial data:', error);
        return {
          total_revenue: 0,
          commissions: 0,
          platform_profit: 0,
          driver_profit: 0
        };
      }
    }
  });

  // تنسيق الأرقام كعملة
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "0 ر.س";
    return `${value.toLocaleString()} ر.س`;
  };

  // تحديد فترة العرض بالعربية
  const getPeriodText = () => {
    switch (timeRange) {
      case "daily": return "اليوم";
      case "weekly": return "هذا الأسبوع";
      case "monthly": return "هذا الشهر";
      case "yearly": return "هذه السنة";
      default: return "هذا الشهر";
    }
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
              <SelectItem value="daily">يومي</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
              <SelectItem value="yearly">سنوي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="إجمالي المبالغ المستلمة"
          value={isLoading ? "جاري التحميل..." : formatCurrency(financialData?.total_revenue)}
          icon={<DollarSign size={20} />}
          description={getPeriodText()}
          textColor="text-green-600"
        />
        <StatCard
          title="إجمالي العمولات (15٪)"
          value={isLoading ? "جاري التحميل..." : formatCurrency(financialData?.commissions)}
          icon={<TrendingUp size={20} />}
          description={getPeriodText()}
          textColor="text-blue-600"
        />
        <StatCard
          title="أرباح المنصة"
          value={isLoading ? "جاري التحميل..." : formatCurrency(financialData?.platform_profit)}
          icon={<DollarSign size={20} />}
          description={getPeriodText()}
          textColor="text-purple-600"
        />
        <StatCard
          title="الأرباح المستحقة للسائقين"
          value={isLoading ? "جاري التحميل..." : formatCurrency(financialData?.driver_profit)}
          icon={<Truck size={20} />}
          description={getPeriodText()}
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
