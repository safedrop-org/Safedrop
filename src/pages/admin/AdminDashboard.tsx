import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/ui/language-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import {
  AdminLayoutWithHeader,
  AdminStats,
  AdminFinancialSummary,
  AdminRecentOrders,
  AdminSystemSettings,
  useAdminStats
} from "@/components/admin";

// Define types
type DateRange = "today" | "week" | "month" | "year";

interface FinancialSummary {
  totalRevenue: number;
  platformProfit: number;
  driversPayout: number;
}

interface LocationObject {
  address: string;
  details?: string;
}

interface Order {
  id: string;
  customer_id: string;
  driver_id: string | null;
  pickup_location: LocationObject;
  dropoff_location: LocationObject;
  status: string;
  price: number;
  commission_rate: number;
  driver_payout: number | null;
  created_at: string;
  updated_at: string;
  estimated_distance: number | null;
  estimated_duration: number | null;
  actual_pickup_time: string | null;
  actual_delivery_time: string | null;
  payment_method: string | null;
  payment_status: string;
  notes: string;
  driver_location: { lat: number; lng: number } | null;
  package_details: string;
  order_id: number;
  order_number: string;
}

const AdminDashboardContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signOut, loading } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [selectedCommissionRate, setSelectedCommissionRate] = useState(20);
  const [systemLanguage, setSystemLanguage] = useState("ar");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [termsOfService, setTermsOfService] = useState("");
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    platformProfit: 0,
    driversPayout: 0,
  });

  // استخدام الـ hook الجديد للإحصائيات
  const {
    customersCount,
    driversCount,
    ordersCount,
    isLoadingCustomers,
    isLoadingDrivers,
    isLoadingOrders
  } = useAdminStats();

  const { data: orders = [], isLoading: isLoadingOrdersList } = useQuery({
    queryKey: ["orders-list"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(
            "id, order_id, order_number, status, created_at, pickup_location, dropoff_location, price"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(5);
        if (error) {
          console.error("Error fetching orders:", error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
      }
    },
  });

  const { data: systemSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("*");

        if (error) {
          console.error("Error fetching system settings:", error);
          return null;
        }

        const settings: Record<string, string> = {};
        ((data as { setting_key: string; setting_value: unknown }[]) || []).forEach((item) => {
          const key = item.setting_key;
          let value = item.setting_value;

          if (key && value !== null && value !== undefined) {
            // Handle different data types in setting_value
            if (typeof value === "object") {
              // If it's stored as JSON, extract the value
              value = typeof value === "string" ? value : JSON.stringify(value);
            } else if (typeof value === "number") {
              value = value.toString();
            }
            settings[key] = value as string;
          }
        });

        if (settings.driver_commission_rate) {
          const rate = parseFloat(settings.driver_commission_rate);
          setSelectedCommissionRate(Math.round(rate * 100));
        }

        if (settings.system_language) {
          setSystemLanguage(settings.system_language);
        }
        if (settings.privacy_policy) {
          setPrivacyPolicy(settings.privacy_policy);
        }
        if (settings.terms_of_service) {
          setTermsOfService(settings.terms_of_service);
        }

        return settings;
      } catch (error) {
        console.error("Error fetching system settings:", error);
        return null;
      }
    },
  });

  const { data: financialData, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ["financial-data", dateRange],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("get_financial_summary", {
          period_type: dateRange,
        });
        if (error) throw error;
        return (
          data || {
            total_revenue: 0,
            platform_profit: 0,
            driver_profit: 0,
          }
        );
      } catch (error) {
        console.error("Error fetching financial data:", error);
        return {
          total_revenue: 0,
          platform_profit: 0,
          driver_profit: 0,
        };
      }
    },
  });

  useEffect(() => {
    if (financialData) {
      setFinancialSummary({
        totalRevenue: financialData.total_revenue || 0,
        platformProfit: financialData.platform_profit || 0,
        driversPayout: financialData.driver_profit || 0,
      });
    }
  }, [financialData]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success(t("logoutSuccess"));
      navigate("/login?logout=true", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error(t("logoutError"));
    }
  };

  const handleUpdateCommissionRate = async () => {
    try {
      // Convert percentage to decimal (20% = 0.20)
      const rateAsDecimal = selectedCommissionRate / 100;

      // Check if driver_commission_rate exists
      const { data: existingData, error: selectError } = await supabase
        .from("system_settings")
        .select("*")
        .eq("setting_key", "driver_commission_rate")
        .single();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from("system_settings")
          .update({
            setting_value: rateAsDecimal,
            updated_at: new Date().toISOString(),
          })
          .eq("setting_key", "driver_commission_rate");

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase.from("system_settings").insert({
          setting_key: "driver_commission_rate",
          setting_value: rateAsDecimal,
          description: `Driver commission rate (${selectedCommissionRate}%)`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast.success(`${t("commissionRateUpdated")} ${selectedCommissionRate}%`);
    } catch (error) {
      console.error("Error updating commission rate:", error);
      toast.error(t("errorUpdatingCommissionRate"));
    }
  };

  // Updated system language update function
  const handleUpdateSystemLanguage = async (language: string) => {
    try {
      // Check if system_language exists
      const { data: existingData, error: selectError } = await supabase
        .from("system_settings")
        .select("*")
        .eq("setting_key", "system_language")
        .single();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from("system_settings")
          .update({
            setting_value: language,
            updated_at: new Date().toISOString(),
          })
          .eq("setting_key", "system_language");

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase.from("system_settings").insert({
          setting_key: "system_language",
          setting_value: language,
          description: "Default system language",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      setSystemLanguage(language);
      toast.success(
        language === "ar"
          ? t("systemLanguageUpdatedToArabic")
          : t("systemLanguageUpdatedToEnglish")
      );
    } catch (error) {
      console.error("Error updating system language:", error);
      toast.error(t("errorUpdatingSystemLanguage"));
    }
  };

  // Updated privacy policy update function
  const handleUpdatePrivacyPolicy = async () => {
    try {
      const { data: existingData, error: selectError } = await supabase
        .from("system_settings")
        .select("*")
        .eq("setting_key", "privacy_policy")
        .single();

      if (existingData) {
        const { error } = await supabase
          .from("system_settings")
          .update({
            setting_value: privacyPolicy,
            updated_at: new Date().toISOString(),
          })
          .eq("setting_key", "privacy_policy");

        if (error) throw error;
      } else {
        const { error } = await supabase.from("system_settings").insert({
          setting_key: "privacy_policy",
          setting_value: privacyPolicy,
          description: "Privacy policy content",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast.success(t("privacyPolicyUpdated"));
    } catch (error) {
      console.error("Error updating privacy policy:", error);
      toast.error(t("errorUpdatingPrivacyPolicy"));
    }
  };

  // Updated terms of service update function
  const handleUpdateTermsOfService = async () => {
    try {
      const { data: existingData, error: selectError } = await supabase
        .from("system_settings")
        .select("*")
        .eq("setting_key", "terms_of_service")
        .single();

      if (existingData) {
        const { error } = await supabase
          .from("system_settings")
          .update({
            setting_value: termsOfService,
            updated_at: new Date().toISOString(),
          })
          .eq("setting_key", "terms_of_service");

        if (error) throw error;
      } else {
        const { error } = await supabase.from("system_settings").insert({
          setting_key: "terms_of_service",
          setting_value: termsOfService,
          description: "Terms of service content",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast.success(t("termsOfServiceUpdated"));
    } catch (error) {
      console.error("Error updating terms of service:", error);
      toast.error(t("errorUpdatingTermsOfService"));
    }
  };

  if (loading) {
    return (
      <AdminLayoutWithHeader title={t("adminDashboardTitle")}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
        </div>
      </AdminLayoutWithHeader>
    );
  }

  return (
    <AdminLayoutWithHeader title={t("adminDashboardTitle")}>
      <div className="max-w-7xl mx-auto">
        {/* مكون الإحصائيات الأساسية */}
        <AdminStats
          customersCount={customersCount}
          driversCount={driversCount}
          ordersCount={ordersCount}
          isLoadingCustomers={isLoadingCustomers}
          isLoadingDrivers={isLoadingDrivers}
          isLoadingOrders={isLoadingOrders}
        />

        <Tabs defaultValue="financial" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="financial">
              {t("financialSummary")}
            </TabsTrigger>
            <TabsTrigger value="orders">{t("orders")}</TabsTrigger>
            <TabsTrigger value="settings">{t("settings")}</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-4">
            <AdminFinancialSummary
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              financialData={{
                totalRevenue: financialData?.total_revenue || 0,
                platformProfit: financialData?.platform_profit || 0,
                driversPayout: financialData?.driver_profit || 0,
              }}
              isLoading={isLoadingFinancial}
            />
          </TabsContent>

          <TabsContent value="orders">
            <AdminRecentOrders
              orders={orders as Order[]}
              isLoading={isLoadingOrdersList}
            />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSystemSettings
              selectedCommissionRate={selectedCommissionRate}
              setSelectedCommissionRate={setSelectedCommissionRate}
              systemLanguage={systemLanguage}
              privacyPolicy={privacyPolicy}
              setPrivacyPolicy={setPrivacyPolicy}
              termsOfService={termsOfService}
              setTermsOfService={setTermsOfService}
              onUpdateCommissionRate={handleUpdateCommissionRate}
              onUpdateSystemLanguage={handleUpdateSystemLanguage}
              onUpdatePrivacyPolicy={handleUpdatePrivacyPolicy}
              onUpdateTermsOfService={handleUpdateTermsOfService}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayoutWithHeader>
  );
};

const AdminDashboard = () => {
  return (
    <AdminDashboardContent />
  );
};

export default AdminDashboard;
