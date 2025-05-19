import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Hook to fetch orders with optimized data loading
 * @param isAdmin - Whether the current user is an admin
 */
export function useOrders(isAdmin = false) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["orders", user?.id, isAdmin],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      // Fetch orders with optimized query
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .order("order_id", { ascending: false });

      if (error) throw error;
      if (!orders?.length) return [];

      // Collect all unique customer IDs to fetch in a single batch
      const customerIds = [
        ...new Set(orders.map((order) => order.customer_id)),
      ];

      // Batch fetch all customer profiles in a single query
      const { data: customers, error: customersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, phone")
        .in("id", customerIds);

      if (customersError) {
        console.error("Error fetching customer data:", customersError);
      }

      // Create a lookup map for quick access
      const customerMap = (customers || []).reduce((acc, customer) => {
        acc[customer.id] = customer;
        return acc;
      }, {});

      // Enrich orders with customer data from the map
      return orders.map((order) => ({
        ...order,
        customer: customerMap[order.customer_id] || null,
        // RLS handles actual permissions
        canModify: true,
      }));
    },
    enabled: !!user,
    // Optimized refetch settings
    staleTime: 60000, // Data stays fresh for 1 minute
    gcTime: 300000, // Cache kept for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    // Use manual refetch trigger for real-time updates instead of polling
    refetchInterval: false,
  });
}

/**
 * Hook to fetch a single order by ID
 * @param orderId - The ID of the order to fetch
 */
export function useOrderById(orderId) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!user || !orderId) throw new Error("Missing required parameters");

      // Fetch order data
      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (error) throw error;
      if (!order) throw new Error("Order not found");

      // Fetch both customer and driver profiles in parallel
      const [customerResult, driverResult] = await Promise.all([
        // Fetch customer profile
        supabase
          .from("profiles")
          .select("first_name, last_name, phone")
          .eq("id", order.customer_id)
          .maybeSingle(),

        // Conditionally fetch driver profile if exists
        order.driver_id
          ? supabase
              .from("profiles")
              .select("first_name, last_name, phone")
              .eq("id", order.driver_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      // Return enriched order
      return {
        ...order,
        customer: customerResult.error ? null : customerResult.data,
        driver: driverResult.error ? null : driverResult.data,
      };
    },
    enabled: Boolean(user && orderId),
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
