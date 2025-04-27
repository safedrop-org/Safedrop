
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
        const { data: orders, error } = await supabase
          .from('orders')
          .select(`
            *,
            customer:profiles!orders_customer_id_fkey(first_name, last_name),
            driver:profiles!orders_driver_id_fkey(first_name, last_name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return orders;
      }
      
      // Regular customer query
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:profiles(first_name, last_name),
          driver:profiles(first_name, last_name)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return orders;
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

      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:profiles!orders_customer_id_fkey(first_name, last_name, phone),
          driver:profiles!orders_driver_id_fkey(first_name, last_name, phone)
        `)
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return order;
    },
    enabled: !!user && !!orderId
  });
};
