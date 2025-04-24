
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:profiles!orders_customer_id_fkey(first_name, last_name),
          driver:profiles!orders_driver_id_fkey(first_name, last_name)
        `);

      if (error) throw error;
      return orders;
    }
  });
};
