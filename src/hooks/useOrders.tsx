
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";

export const useOrders = (isAdmin = false) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', user?.id, isAdmin],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Admin query - fetch all orders
      if (isAdmin) {
        // Modified query to avoid using foreign key constraints in the select statement
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Fetch customer and driver profiles separately
        const enrichedOrders = await Promise.all(
          orders.map(async (order) => {
            // Get customer profile
            const { data: customer } = await supabase
              .from('profiles')
              .select('first_name, last_name, phone')
              .eq('id', order.customer_id)
              .single();
            
            // Get driver profile if available
            let driver = null;
            if (order.driver_id) {
              const { data: driverData } = await supabase
                .from('profiles')
                .select('first_name, last_name, phone')
                .eq('id', order.driver_id)
                .single();
              driver = driverData;
            }
            
            return {
              ...order,
              customer,
              driver
            };
          })
        );
        
        return enrichedOrders;
      }
      
      // Regular customer query
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch driver profiles separately if needed
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          let driver = null;
          if (order.driver_id) {
            const { data: driverData } = await supabase
              .from('profiles')
              .select('first_name, last_name, phone')
              .eq('id', order.driver_id)
              .single();
            driver = driverData;
          }
          
          return {
            ...order,
            driver
          };
        })
      );
      
      return enrichedOrders;
    },
    enabled: !!user
  });
};

// Function to fetch a single order by ID
export const useOrderById = (orderId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Modified query to avoid using foreign key constraints
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      
      // Fetch customer and driver profiles separately
      // Customer profile
      const { data: customer } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone')
        .eq('id', order.customer_id)
        .single();
      
      // Driver profile if available
      let driver = null;
      if (order.driver_id) {
        const { data: driverData } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone')
          .eq('id', order.driver_id)
          .single();
        driver = driverData;
      }
      
      return {
        ...order,
        customer,
        driver
      };
    },
    enabled: !!user && !!orderId
  });
};
