import { supabase } from "@/integrations/supabase/client";
import { NOTIFICATION_TYPES } from "@/constants/complaint";
import { getIssueTypeLabel } from "@/utils/complaintUtils";
import { ComplaintData, AdminUser } from "@/types/complaint";

// Create notifications for complaint
export const createComplaintNotifications = async (
  complaintData: ComplaintData,
  userName: string,
  userId: string,
  t: (key: string) => string
): Promise<void> => {
  try {
    // Create customer notification
    await supabase.from("customer_notifications").insert({
      customer_id: userId,
      title: t("complaintConfirmationTitle"),
      message: t("complaintConfirmationMessage").replace(
        "{issueType}",
        getIssueTypeLabel(complaintData.issue_type, t)
      ),
      notification_type: NOTIFICATION_TYPES.COMPLAINT_CONFIRMATION,
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Find admin users for notifications
    const admins = await findAdminUsers();

    if (admins && admins.length > 0) {
      const adminNotifications = admins.map((admin) => ({
        customer_id: admin.id,
        title: t("newComplaintTitle"),
        message: t("newComplaintMessage")
          .replace("{userName}", userName)
          .replace(
            "{issueType}",
            getIssueTypeLabel(complaintData.issue_type, t)
          ),
        notification_type: NOTIFICATION_TYPES.NEW_COMPLAINT,
        read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      await supabase
        .from("customer_notifications")
        .insert(adminNotifications);
    } else {
      console.warn("No admin users found for notifications");
    }
  } catch (error) {
    console.error("Error creating notifications:", error);
  }
};

// Helper function to find admin users
const findAdminUsers = async (): Promise<AdminUser[] | null> => {
  // Try role-based search first
  let { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (!admins || admins.length === 0) {
    // Try user_type-based search
    const { data: adminsByType } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_type", "admin");

    if (adminsByType && adminsByType.length > 0) {
      admins = adminsByType;
    }
  }

  if (!admins || admins.length === 0) {
    // Try email-based search as fallback
    const { data: adminsByEmail } = await supabase
      .from("profiles")
      .select("id")
      .or("email.ilike.%admin%,email.ilike.%support%");

    if (adminsByEmail && adminsByEmail.length > 0) {
      admins = adminsByEmail;
    }
  }

  return admins;
};

// Send email notification for complaint
export const sendComplaintEmailNotification = async (
  complaintData: ComplaintData,
  userId: string,
  language: string
): Promise<void> => {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", userId)
      .single();

    if (!profile) {
      console.log("No profile found for user");
      return;
    }

    console.log("Attempting to send email to:", profile.email);

    const { data: emailResult, error: emailError } =
      await supabase.functions.invoke("send-complaint-confirmation", {
        body: {
          to: profile.email,
          language: language,
          complaintData: {
            ...complaintData,
            userName: `${profile.first_name} ${profile.last_name}`,
            userEmail: profile.email,
          },
        },
      });

    if (emailError) {
      console.error("Error sending email:", emailError);
    } else {
      console.log("Email sent successfully:", emailResult);
    }
  } catch (error) {
    console.error("Error in sendComplaintEmailNotification:", error);
  }
};