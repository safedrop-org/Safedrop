import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, LineChart, TruckIcon } from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";

type DateRange = "today" | "week" | "month" | "year";

interface FinancialCardData {
  totalRevenue: number;
  platformProfit: number;
  driversPayout: number;
}

interface AdminFinancialSummaryProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  financialData: FinancialCardData;
  isLoading: boolean;
}

/**
 * AdminFinancialSummary - مكون عرض الملخص المالي في لوحة الإدارة
 * يعرض الإيرادات والأرباح ومدفوعات السائقين
 */
const AdminFinancialSummary: React.FC<AdminFinancialSummaryProps> = ({
  dateRange,
  onDateRangeChange,
  financialData,
  isLoading
}) => {
  const { t } = useLanguage();

  const formatCurrency = (value: number) => {
    if (value === undefined || value === null) return `0 ${t("currency")}`;
    return `${value.toLocaleString()} ${t("currency")}`;
  };

  const financialCards = [
    {
      title: t("totalAmountReceived"),
      value: financialData.totalRevenue,
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: t("platformProfits"),
      value: financialData.platformProfit,
      icon: LineChart,
      bgColor: "bg-violet-100",
      iconColor: "text-violet-600"
    },
    {
      title: t("driverPayouts"),
      value: financialData.driversPayout,
      icon: TruckIcon,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center">
          <CardTitle className="text-xl">
            {t("financialSummary")}
          </CardTitle>
          <Select
            value={dateRange}
            onValueChange={(value) => onDateRangeChange(value as DateRange)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("selectPeriod")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t("today")}</SelectItem>
              <SelectItem value="week">{t("lastWeek")}</SelectItem>
              <SelectItem value="month">{t("lastMonth")}</SelectItem>
              <SelectItem value="year">{t("lastYear")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {financialCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">
                        {card.title}
                      </p>
                      <h3 className="text-2xl font-bold">
                        {isLoading ? "..." : formatCurrency(card.value)}
                      </h3>
                    </div>
                    <div className={`p-3 ${card.bgColor} rounded-full`}>
                      <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFinancialSummary;
