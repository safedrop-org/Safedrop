
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useComplaints = () => {
  return useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const { data: complaints, error } = await supabase
        .from('complaints')
        .select(`
          *,
          user:profiles!complaints_user_id_fkey(first_name, last_name, user_type),
          order:orders(id)
        `);

      if (error) throw error;
      return complaints;
    }
  });
};
