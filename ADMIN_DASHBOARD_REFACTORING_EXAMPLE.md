# مثال على كيفية تحديث AdminDashboard لاستخدام المكونات الجديدة

## الكود الحالي (مبسط):
```tsx
const AdminDashboardContent = () => {
  const { t } = useLanguage();
  
  // Duplicate queries for each stat
  const { data: customersCount = 0, isLoading: isLoadingCustomers } = useQuery({...});
  const { data: driversCount = 0, isLoading: isLoadingDrivers } = useQuery({...});
  const { data: ordersCount = 0, isLoading: isLoadingOrders } = useQuery({...});

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {t("adminDashboardTitle")}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Duplicate Card structure for each stat */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-safedrop-gold" />
                    <span>{t("customers")}</span>
                  </CardTitle>
                  <CardDescription>{t("totalCustomersRegistered")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {isLoadingCustomers ? <span className="text-gray-400">...</span> : customersCount}
                  </p>
                </CardContent>
              </Card>
              {/* Same for drivers and orders... */}
            </div>
            {/* Rest of dashboard content */}
          </div>
        </main>
      </div>
    </div>
  );
};
```

## الكود المحسن المقترح:
```tsx
import { AdminLayoutWithHeader, AdminStats, useAdminStats } from "@/components/admin";

const AdminDashboardContent = () => {
  const { t } = useLanguage();
  
  // Single hook for all stats
  const {
    customersCount,
    driversCount,
    ordersCount,
    isLoadingCustomers,
    isLoadingDrivers,
    isLoadingOrders
  } = useAdminStats();

  return (
    <AdminLayoutWithHeader title={t("adminDashboardTitle")}>
      <div className="max-w-7xl mx-auto">
        {/* Simplified stats section */}
        <AdminStats
          customersCount={customersCount}
          driversCount={driversCount}
          ordersCount={ordersCount}
          isLoadingCustomers={isLoadingCustomers}
          isLoadingDrivers={isLoadingDrivers}
          isLoadingOrders={isLoadingOrders}
        />
        
        {/* Rest of dashboard content */}
        {/* Charts, tables, etc. */}
      </div>
    </AdminLayoutWithHeader>
  );
};
```

## الفوائد:
1. **تقليل الكود**: من ~100+ سطر إلى ~30 سطر للجزء المحدث
2. **وضوح أكبر**: الكود أصبح أكثر قابلية للقراءة
3. **سهولة الصيانة**: التغييرات في مكان واحد
4. **إعادة الاستخدام**: المكونات قابلة للاستخدام في صفحات أخرى
