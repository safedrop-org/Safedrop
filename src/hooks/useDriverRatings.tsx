
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
        // أولا، نقوم بجلب التقييمات من جدول driver_ratings
        const { data: ratings, error } = await supabase
          .from('driver_ratings')
          .select(`
            *,
            customer:customer_id(first_name, last_name)
          `)
          .eq('driver_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching ratings:", error);
          throw error;
        }

        // ثم نقوم بجلب معلومات الطلبات المرتبطة بالتقييمات
        if (ratings && ratings.length > 0) {
          // استخراج معرفات الطلبات من التقييمات
          const orderIds = ratings.map(rating => rating.order_id);
          
          // جلب معلومات الطلبات
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, pickup_location, dropoff_location, created_at')
            .in('id', orderIds);
          
          if (ordersError) {
            console.error("Error fetching orders:", ordersError);
          } else if (orders) {
            // دمج معلومات الطلبات مع التقييمات
            const ratingsWithOrders = ratings.map(rating => {
              const relatedOrder = orders.find(order => order.id === rating.order_id);
              return {
                ...rating,
                order: relatedOrder || null
              };
            });
            
            console.log("Fetched ratings with orders:", ratingsWithOrders);
            return ratingsWithOrders;
          }
        }
        
        console.log("Fetched ratings:", ratings);
        return ratings || [];
      } catch (error) {
        console.error("Error in useDriverRatings hook:", error);
        throw error;
      }
    },
    enabled: !!user
  });
};
