
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useOrders = (isAdmin = false) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', user?.id, isAdmin],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      try {
        console.log("Fetching orders for driver:", user.id);
        
        let query = supabase.from('orders').select('*');
        
        // For non-admins (drivers), we need to carefully filter orders:
        if (!isAdmin) {
          console.log("Filtering for driver:", user.id);
          
          // This updated query gets:
          // 1. ALL orders with status='available' (regardless of driver_id, which should be null anyway) 
          // 2. OR any order assigned specifically to this driver (regardless of status)
          query = query.or(`status.eq.available,driver_id.eq.${user.id}`);
          
          console.log("Using filter:", `status.eq.available,driver_id.eq.${user.id}`);
        }
        
        const { data: orders, error } = await query
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
          throw error;
        }
        
        if (!orders || orders.length === 0) {
          console.log("No orders found");
          return [];
        }
        
        console.log(`Found ${orders.length} orders before filtering`);
        
        // Enrich orders with customer data
        const enrichedOrders = await Promise.all(
          orders.map(async (order) => {
            try {
              // Get customer data
              const { data: customer, error: customerError } = await supabase
                .from('profiles')
                .select('first_name, last_name, phone')
                .eq('id', order.customer_id)
                .maybeSingle();
              
              if (customerError) {
                console.error(`Error fetching customer data for order ${order.id}:`, customerError);
                return { ...order, customer: null };
              }
              
              // Verify ownership for drivers
              let canModify = isAdmin;
              
              if (!isAdmin && order.driver_id) {
                // Driver can only modify orders assigned to them
                canModify = order.driver_id === user.id;
              }
              
              return { 
                ...order, 
                customer,
                canModify // Add this flag to track whether the driver can modify this order
              };
            } catch (err) {
              console.error(`Error enriching order ${order.id}:`, err);
              return { ...order, customer: null, canModify: false };
            }
          })
        );
        
        console.log("Enriched orders:", enrichedOrders.length);
        return enrichedOrders;
      } catch (error) {
        console.error("Error in useOrders hook:", error);
        throw error;
      }
    },
    enabled: !!user,
    refetchOnMount: true,
    retry: 2,
    refetchInterval: 5000, // Refresh every 5 seconds to keep order list updated
    refetchOnWindowFocus: true, // Also refresh when window regains focus
    refetchOnReconnect: true, // Refresh on reconnection
    staleTime: 2000, // Consider data stale after 2 seconds
  });
};

// Function to fetch a single order by ID
export const useOrderById = (orderId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      if (!orderId) {
        console.error("No order ID provided");
        throw new Error('No order ID provided');
      }

      try {
        console.log("Fetching order details for ID:", orderId);
        
        // Modified query to avoid using foreign key constraints
        const { data: order, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching order details:", error);
          throw error;
        }
        
        if (!order) {
          console.error("Order not found");
          throw new Error('Order not found');
        }
        
        console.log("Order data fetched:", order);
        
        // Fetch customer and driver profiles separately
        
        // Customer profile
        const { data: customer, error: customerError } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone')
          .eq('id', order.customer_id)
          .maybeSingle();
        
        if (customerError) {
          console.error("Error fetching customer profile:", customerError);
        }
        
        // Driver profile if available
        let driver = null;
        if (order.driver_id) {
          const { data: driverData, error: driverError } = await supabase
            .from('profiles')
            .select('first_name, last_name, phone')
            .eq('id', order.driver_id)
            .maybeSingle();
            
          if (driverError) {
            console.error("Error fetching driver profile:", driverError);
          } else {
            driver = driverData;
          }
        }
        
        const enrichedOrder = {
          ...order,
          customer,
          driver
        };
        
        console.log("Enriched order data:", enrichedOrder);
        return enrichedOrder;
      } catch (error) {
        console.error("Error in useOrderById hook:", error);
        throw error;
      }
    },
    enabled: !!user && !!orderId,
    retry: 1
  });
};
