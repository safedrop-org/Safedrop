
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/ui/language-context";

export const useProfile = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  return useQuery({
    queryKey: ['profile', user?.id, language],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // First check if we have user_type in user metadata
      if (user.user_metadata?.user_type) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          // If profile doesn't exist yet but we have metadata, create a minimal profile
          if (error.code === 'PGRST116') {
            const newProfile = {
              id: user.id,
              first_name: user.user_metadata.first_name || '',
              last_name: user.user_metadata.last_name || '',
              phone: user.user_metadata.phone || '',
              user_type: user.user_metadata.user_type,
              email: user.email
            };
            
            // Create profile
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();
              
            if (createError) throw createError;
            return createdProfile;
          }
          throw error;
        }
        
        return data;
      }
      
      // Fallback to normal profile lookup
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
