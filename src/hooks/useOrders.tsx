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

      let orders = [];

      if (isAdmin) {
        // Admin: Fetch all orders
        const { data: allOrders, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        orders = allOrders || [];
      } else {
        // Check if user is a driver
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (rolesError) {
          console.error("Error fetching user roles:", rolesError);
          throw rolesError;
        }

        const isDriver = userRoles?.some((role) => role.role === "driver");
        const isCustomer = userRoles?.some((role) => role.role === "customer");

        if (isDriver) {
          // Driver: Check if approved first
          const { data: driverData, error: driverError } = await supabase
            .from("drivers")
            .select("status")
            .eq("id", user.id)
            .maybeSingle();

          if (driverError) {
            console.error("Error checking driver status:", driverError);
            throw driverError;
          }

          if (!driverData || driverData.status !== "approved") {
            return [];
          }

          // Fetch available orders and driver's assigned orders
          const [availableOrdersResult, assignedOrdersResult] =
            await Promise.all([
              // Available orders (not assigned to any driver)
              supabase
                .from("orders")
                .select("*")
                .is("driver_id", null)
                .eq("status", "available")
                .order("created_at", { ascending: false }),

              // Driver's assigned orders
              supabase
                .from("orders")
                .select("*")
                .eq("driver_id", user.id)
                .order("created_at", { ascending: false }),
            ]);

          if (availableOrdersResult.error) {
            console.error(
              "Error fetching available orders:",
              availableOrdersResult.error
            );
          }

          if (assignedOrdersResult.error) {
            console.error(
              "Error fetching assigned orders:",
              assignedOrdersResult.error
            );
          }

          // Combine results
          orders = [
            ...(availableOrdersResult.data || []),
            ...(assignedOrdersResult.data || []),
          ];
        } else if (isCustomer) {
          // Customer: Fetch only their orders
          const { data: customerOrders, error } = await supabase
            .from("orders")
            .select("*")
            .eq("customer_id", user.id)
            .order("created_at", { ascending: false });

          if (error) throw error;
          orders = customerOrders || [];
        } else {
          // Unknown user type
          return [];
        }
      }

      if (!orders?.length) {
        return [];
      }

      // Extract unique customer IDs
      const customerIds = orders
        .map((order) => order.customer_id)
        .filter(Boolean)
        .filter((id, index, arr) => arr.indexOf(id) === index);

      if (customerIds.length === 0) {
        return orders.map((order) => ({
          ...order,
          customer: null,
          canModify: true,
        }));
      }

      // Fetch customer profiles
      const { data: customers, error: customersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, phone, email")
        .in("id", customerIds);

      if (customersError) {
        console.error("Error fetching customers:", customersError);
        return orders.map((order) => ({
          ...order,
          customer: null,
          canModify: true,
        }));
      }

      // Create customer lookup map
      const customerMap = (customers || []).reduce((acc, customer) => {
        acc[customer.id] = customer;
        return acc;
      }, {});

      // Enrich orders with customer data
      const enrichedOrders = orders.map((order) => ({
        ...order,
        customer: customerMap[order.customer_id] || null,
        canModify: true,
      }));

      return enrichedOrders;
    },
    enabled: !!user,
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: false,
    retry: (failureCount, error) => {
      console.error(`Query failed (attempt ${failureCount}):`, error);
      return failureCount < 2;
    },
    retryDelay: 1000,
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

      // Fetch customer and driver profiles separately
      const customerPromise = order.customer_id
        ? supabase
            .from("profiles")
            .select("id, first_name, last_name, phone, email")
            .eq("id", order.customer_id)
            .maybeSingle()
        : Promise.resolve({ data: null });

      const driverPromise = order.driver_id
        ? supabase
            .from("profiles")
            .select("id, first_name, last_name, phone, email")
            .eq("id", order.driver_id)
            .maybeSingle()
        : Promise.resolve({ data: null });

      const [customerResult, driverResult] = await Promise.all([
        customerPromise,
        driverPromise,
      ]);

      return {
        ...order,
        customer: customerResult.error ? null : customerResult.data,
        driver: driverResult.error ? null : driverResult.data,
      };
    },
    enabled: Boolean(user && orderId),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
