
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useDriverRatings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['driver_ratings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data: ratings, error } = await supabase
        .from('driver_ratings')
        .select(`
          *,
          order:orders(
            id,
            pickup_location,
            dropoff_location,
            driver:profiles(first_name, last_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return ratings;
    },
    enabled: !!user
  });
};
