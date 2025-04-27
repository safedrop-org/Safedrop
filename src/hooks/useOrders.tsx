
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";

export const useOrders = (isAdmin = false) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', user?.id, isAdmin],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      try {
        console.log("Fetching orders for driver:", user.id);
        
        // Fetch both available orders and orders assigned to the driver
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .or(`driver_id.is.null,driver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
          throw error;
        }
        
        if (!orders || orders.length === 0) {
          console.log("No orders found");
          return [];
        }
        
        // Fetch customer profiles separately
        console.log(`Found ${orders.length} orders`);
        
        // Enrich orders with customer data
        const enrichedOrders = await Promise.all(
          orders.map(async (order) => {
            // Get customer data
            const { data: customer, error: customerError } = await supabase
              .from('profiles')
              .select('first_name, last_name, phone')
              .eq('id', order.customer_id)
              .maybeSingle();
            
            if (customerError) {
              console.error("Error fetching customer data:", customerError);
              return { ...order, customer: null };
            }
            
            return { 
              ...order, 
              customer 
            };
          })
        );
        
        return enrichedOrders;
      } catch (error) {
        console.error("Error in useOrders hook:", error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 1
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
