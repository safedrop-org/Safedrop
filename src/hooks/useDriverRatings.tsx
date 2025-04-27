
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useDriverRatings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['driver_ratings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      try {
        const { data: ratings, error } = await supabase
          .from('driver_ratings')
          .select(`
            *,
            order:orders(
              id,
              pickup_location,
              dropoff_location,
              created_at
            ),
            customer:profiles(first_name, last_name)
          `)
          .eq('driver_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching ratings:", error);
          throw error;
        }

        return ratings || [];
      } catch (error) {
        console.error("Error in useDriverRatings hook:", error);
        throw error;
      }
    },
    enabled: !!user
  });
};

export const useCustomerRatings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['customer_ratings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      try {
        const { data: ratings, error } = await supabase
          .from('driver_ratings')
          .select(`
            *,
            order:orders(
              id,
              pickup_location,
              dropoff_location,
              created_at
            ),
            driver:profiles!driver_ratings_driver_id_fkey(first_name, last_name)
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching customer ratings:", error);
          throw error;
        }

        return ratings || [];
      } catch (error) {
        console.error("Error in useCustomerRatings hook:", error);
        throw error;
      }
    },
    enabled: !!user
  });
};
