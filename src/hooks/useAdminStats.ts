import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * useAdminStats - Hook لجلب الإحصائيات الأساسية للإدارة
 * يجلب أعداد العملاء والسائقين والطلبات
 */
export const useAdminStats = () => {
  const customersQuery = useQuery({
    queryKey: ["admin-customers-count"],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from("profiles")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("user_type", "customer");
        
        if (error) {
          console.error("Error fetching customers count:", error);
          return 0;
        }
        return count || 0;
      } catch (error) {
        console.error("Error fetching customers count:", error);
        return 0;
      }
    },
  });

  const driversQuery = useQuery({
    queryKey: ["admin-drivers-count"],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from("drivers")
          .select("*", {
            count: "exact",
            head: true,
          });
        
        if (error) {
          console.error("Error fetching drivers count:", error);
          return 0;
        }
        return count || 0;
      } catch (error) {
        console.error("Error fetching drivers count:", error);
        return 0;
      }
    },
  });

  const ordersQuery = useQuery({
    queryKey: ["admin-orders-count"],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from("orders")
          .select("*", {
            count: "exact",
            head: true,
          });
        
        if (error) {
          console.error("Error fetching orders count:", error);
          return 0;
        }
        return count || 0;
      } catch (error) {
        console.error("Error fetching orders count:", error);
        return 0;
      }
    },
  });

  return {
    customersCount: customersQuery.data || 0,
    driversCount: driversQuery.data || 0,
    ordersCount: ordersQuery.data || 0,
    isLoadingCustomers: customersQuery.isLoading,
    isLoadingDrivers: driversQuery.isLoading,
    isLoadingOrders: ordersQuery.isLoading,
    isLoading: customersQuery.isLoading || driversQuery.isLoading || ordersQuery.isLoading,
  };
};
