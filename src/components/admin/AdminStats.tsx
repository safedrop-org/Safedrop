import React from "react";
import { StatCard } from "@/components/admin";
import { UsersIcon, TruckIcon, PackageIcon } from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";

interface AdminStatsProps {
  customersCount: number;
  driversCount: number;
  ordersCount: number;
  isLoadingCustomers?: boolean;
  isLoadingDrivers?: boolean;
  isLoadingOrders?: boolean;
}

/**
 * AdminStats - مكون عرض الإحصائيات الرئيسية في لوحة الإدارة
 * يعرض أعداد العملاء والسائقين والطلبات
 */
const AdminStats: React.FC<AdminStatsProps> = ({
  customersCount,
  driversCount,
  ordersCount,
  isLoadingCustomers = false,
  isLoadingDrivers = false,
  isLoadingOrders = false
}) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        title={t("customers")}
        value={customersCount}
        icon={UsersIcon}
        description={t("totalCustomersRegistered")}
        isLoading={isLoadingCustomers}
      />
      
      <StatCard
        title={t("drivers")}
        value={driversCount}
        icon={TruckIcon}
        description={t("totalDriversRegistered")}
        isLoading={isLoadingDrivers}
      />
      
      <StatCard
        title={t("orders")}
        value={ordersCount}
        icon={PackageIcon}
        description={t("totalOrders")}
        isLoading={isLoadingOrders}
      />
    </div>
  );
};

export default AdminStats;
