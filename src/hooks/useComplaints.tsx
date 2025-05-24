import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface ComplaintType {
  id: string;
  complaint_number: number;
  user_id: string;
  issue_type: string;
  description: string;
  order_number?: string;
  status: "pending" | "resolved";
  attachment_url?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    user_type?: string;
  };
}

export interface ComplaintFormData {
  issue_type: string;
  description: string;
  order_number?: string;
  attachment_url?: string;
}

/**
 * Hook to fetch complaints with optimized data loading
 * @param isAdmin - Whether the current user is an admin
 */
export function useComplaints(isAdmin = false) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["complaints", user?.id, isAdmin],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      let complaints = [];

      if (isAdmin) {
        // Admin: Fetch all complaints
        const { data: allComplaints, error } = await supabase
          .from("complaints")
          .select(
            `
            *,
            profiles (
              id,
              first_name,
              last_name,
              email,
              user_type
            )
          `
          )
          .order("complaint_number", { ascending: false });

        if (error) throw error;
        complaints = allComplaints || [];
      } else {
        // Check if user is a driver or customer
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (rolesError) {
          throw rolesError;
        }

        const isDriver = userRoles?.some((role) => role.role === "driver");
        const isCustomer = userRoles?.some((role) => role.role === "customer");

        if (isDriver || isCustomer || !userRoles?.length) {
          // Fetch user's own complaints
          const { data: userComplaints, error } = await supabase
            .from("complaints")
            .select(
              `
              *,
              profiles (
                id,
                first_name,
                last_name,
                email,
                user_type
              )
            `
            )
            .eq("user_id", user.id)
            .order("complaint_number", { ascending: false });

          if (error) throw error;
          complaints = userComplaints || [];
        } else {
          // Unknown user type
          return [];
        }
      }

      if (!complaints?.length) {
        return [];
      }

      // Extract unique user IDs for complaints that don't have profile data
      const userIds = complaints
        .filter((complaint) => !complaint.profiles && complaint.user_id)
        .map((complaint) => complaint.user_id)
        .filter(Boolean)
        .filter((id, index, arr) => arr.indexOf(id) === index);

      // Fetch missing profiles if needed
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, user_type")
          .in("id", userIds);

        if (!profilesError && profiles) {
          // Create profile lookup map
          const profileMap = profiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});

          // Enrich complaints with profile data
          complaints = complaints.map((complaint) => ({
            ...complaint,
            profiles:
              complaint.profiles || profileMap[complaint.user_id] || null,
            canModify: true,
          }));
        }
      } else {
        // Add canModify flag to all complaints
        complaints = complaints.map((complaint) => ({
          ...complaint,
          canModify: true,
        }));
      }

      return complaints;
    },
    enabled: !!user,
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: false,
    retry: (failureCount, error) => {
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
}

/**
 * Hook to fetch a single complaint by ID
 * @param complaintId - The ID of the complaint to fetch
 */
export function useComplaintById(complaintId) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["complaint", complaintId],
    queryFn: async () => {
      if (!user || !complaintId) throw new Error("Missing required parameters");

      // Fetch complaint data
      const { data: complaint, error } = await supabase
        .from("complaints")
        .select(
          `
          *,
          profiles (
            id,
            first_name,
            last_name,
            email,
            user_type
          )
        `
        )
        .eq("id", complaintId)
        .maybeSingle();

      if (error) throw error;
      if (!complaint) throw new Error("Complaint not found");

      // Fetch profile separately if not included
      if (!complaint.profiles && complaint.user_id) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, user_type")
          .eq("id", complaint.user_id)
          .maybeSingle();

        if (!profileError && profile) {
          complaint.profiles = profile;
        }
      }

      return complaint;
    },
    enabled: Boolean(user && complaintId),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Hook to create a new complaint
 */
export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (complaintData: ComplaintFormData) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("complaints")
        .insert({
          user_id: user.id,
          issue_type: complaintData.issue_type,
          description: complaintData.description,
          order_number: complaintData.order_number || null,
          attachment_url: complaintData.attachment_url || null,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("تم إرسال الشكوى بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في إرسال الشكوى");
    },
  });
};

/**
 * Hook to update complaint status
 */
export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      complaintId,
      complaintNumber,
      status,
      adminResponse,
    }: {
      complaintId?: string;
      complaintNumber?: number;
      status: "resolved" | "pending";
      adminResponse?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Update complaint status using either ID or complaint_number
      const updateQuery = complaintId
        ? supabase
            .from("complaints")
            .update({
              status,
              updated_at: new Date().toISOString(),
            })
            .eq("id", complaintId)
        : supabase
            .from("complaints")
            .update({
              status,
              updated_at: new Date().toISOString(),
            })
            .eq("complaint_number", complaintNumber);

      const { error: updateError } = await updateQuery;
      if (updateError) throw updateError;

      // Add admin response if provided
      if (adminResponse?.trim()) {
        const responseData = complaintId
          ? { complaint_id: complaintId }
          : { complaint_number: complaintNumber };

        const { error: responseError } = await supabase
          .from("complaint_responses")
          .insert({
            ...responseData,
            admin_id: user.id,
            response: adminResponse.trim(),
            created_at: new Date().toISOString(),
          });

        if (responseError) throw responseError;
      }

      return { complaintId, complaintNumber, status, adminResponse };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint"] });
      toast.success("تم تحديث حالة الشكوى بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في تحديث الشكوى");
    },
  });
};

/**
 * Hook to fetch user's own complaints
 * @param userId - The ID of the user
 */
export const useUserComplaints = (userId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-complaints", userId],
    queryFn: async () => {
      if (!user || !userId) throw new Error("Missing required parameters");

      const { data, error } = await supabase
        .from("complaints")
        .select(
          `
          *,
          profiles (
            id,
            first_name,
            last_name,
            email,
            user_type
          )
        `
        )
        .eq("user_id", userId)
        .order("complaint_number", { ascending: false });

      if (error) throw error;
      return (data || []) as ComplaintType[];
    },
    enabled: Boolean(user && userId),
    staleTime: 30000,
    retry: 1,
  });
};

/**
 * Hook to fetch complaint responses
 */
export const useComplaintResponses = (complaintId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["complaint-responses", complaintId],
    queryFn: async () => {
      if (!user || !complaintId) throw new Error("Missing required parameters");

      const { data, error } = await supabase
        .from("complaint_responses")
        .select(
          `
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `
        )
        .eq("complaint_id", complaintId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: Boolean(user && complaintId),
    staleTime: 30000,
    retry: 1,
  });
};
