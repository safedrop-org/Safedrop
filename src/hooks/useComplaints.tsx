import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ComplaintType {
  id: string;
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
  };
}

export interface ComplaintFormData {
  issue_type: string;
  description: string;
  order_number?: string;
  attachment_url?: string;
}

export const useComplaints = () => {
  return useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select(
          `
          *,
          profiles (
            id,
            first_name,
            last_name,
            email
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching complaints:", error);
        throw error;
      }

      return (data || []) as ComplaintType[];
    },
  });
};

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      complaintData: ComplaintFormData & { user_id: string }
    ) => {
      const { data, error } = await supabase
        .from("complaints")
        .insert({
          user_id: complaintData.user_id,
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

      if (error) {
        console.error("Error creating complaint:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("تم إرسال الشكوى بنجاح");
    },
    onError: (error) => {
      console.error("Error creating complaint:", error);
      toast.error("حدث خطأ في إرسال الشكوى");
    },
  });
};

export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      complaintId,
      status,
      adminResponse,
    }: {
      complaintId: string;
      status: "resolved" | "pending";
      adminResponse?: string;
    }) => {
      // Update complaint status
      const { error: updateError } = await supabase
        .from("complaints")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", complaintId);

      if (updateError) throw updateError;

      // Add admin response if provided
      if (adminResponse?.trim()) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { error: responseError } = await supabase
          .from("complaint_responses")
          .insert({
            complaint_id: complaintId,
            admin_id: user?.id,
            response: adminResponse.trim(),
            created_at: new Date().toISOString(),
          });

        if (responseError) throw responseError;
      }

      return { complaintId, status, adminResponse };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("تم تحديث حالة الشكوى بنجاح");
    },
    onError: (error) => {
      console.error("Error updating complaint:", error);
      toast.error("حدث خطأ في تحديث الشكوى");
    },
  });
};

export const useUserComplaints = (userId: string) => {
  return useQuery({
    queryKey: ["user-complaints", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user complaints:", error);
        throw error;
      }

      return (data || []) as ComplaintType[];
    },
    enabled: !!userId,
  });
};

export const useComplaintResponses = (complaintId: string) => {
  return useQuery({
    queryKey: ["complaint-responses", complaintId],
    queryFn: async () => {
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

      if (error) {
        console.error("Error fetching complaint responses:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!complaintId,
  });
};
