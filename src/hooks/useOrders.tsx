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
        } else if (isCustomer || userRoles?.length === 0) {
          // Customer: Fetch their orders with driver information
          // Also allow users with no roles (for backwards compatibility)
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

      // Extract unique customer IDs and driver IDs
      const customerIds = orders
        .map((order) => order.customer_id)
        .filter(Boolean)
        .filter((id, index, arr) => arr.indexOf(id) === index);

      const driverIds = orders
        .map((order) => order.driver_id)
        .filter(Boolean)
        .filter((id, index, arr) => arr.indexOf(id) === index);

      console.log("Fetching profiles for:", { customerIds, driverIds });

      // Fetch customer and driver profiles in parallel
      const fetchProfiles = async () => {
        const results = await Promise.allSettled([
          // Fetch customers
          customerIds.length > 0
            ? supabase
                .from("profiles")
                .select("id, first_name, last_name, phone, email")
                .in("id", customerIds)
            : Promise.resolve({ data: [] }),

          // Fetch drivers
          driverIds.length > 0
            ? supabase
                .from("profiles")
                .select("id, first_name, last_name, phone, email")
                .in("id", driverIds)
            : Promise.resolve({ data: [] }),
        ]);

        return {
          customerResult:
            results[0].status === "fulfilled"
              ? results[0].value
              : { data: [], error: results[0].reason },
          driverResult:
            results[1].status === "fulfilled"
              ? results[1].value
              : { data: [], error: results[1].reason },
        };
      };

      const { customerResult, driverResult } = await fetchProfiles();

      if (customerResult.error) {
        console.error("Error fetching customers:", customerResult.error);
      }

      if (driverResult.error) {
        console.error("Error fetching drivers:", driverResult.error);
      }

      console.log("Profile fetch results:", {
        customers: customerResult.data || [],
        drivers: driverResult.data || [],
      });

      // Create lookup maps
      const customerMap = (customerResult.data || []).reduce(
        (acc, customer) => {
          acc[customer.id] = customer;
          return acc;
        },
        {}
      );

      const driverMap = (driverResult.data || []).reduce((acc, driver) => {
        acc[driver.id] = driver;
        return acc;
      }, {});

      console.log("Created lookup maps:", {
        customerMapSize: Object.keys(customerMap).length,
        driverMapSize: Object.keys(driverMap).length,
        customerMap,
        driverMap,
      });

      // Enrich orders with customer and driver data
      const enrichedOrders = orders.map((order) => {
        const customer = customerMap[order.customer_id] || null;
        const driver = driverMap[order.driver_id] || null;

        console.log(`Order ${order.id}:`, {
          customer_id: order.customer_id,
          driver_id: order.driver_id,
          customer: customer,
          driver: driver,
        });

        return {
          ...order,
          customer,
          driver,
          canModify: true,
        };
      });

      console.log("Final enriched orders:", enrichedOrders);
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
