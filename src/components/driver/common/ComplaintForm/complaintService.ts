import { supabase } from '@/integrations/supabase/client';
import { getIssueTypeLabel } from './utils';
import { ComplaintData } from './types';

export const uploadFile = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `complaint-attachments/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("complaint-attachments")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from("complaint-attachments")
      .getPublicUrl(filePath);

    if (urlData?.publicUrl) {
      return urlData.publicUrl;
    }

    throw new Error("Failed to get public URL");
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

export const createNotifications = async (
  complaintData: ComplaintData, 
  userName: string, 
  userId: string, 
  t: (key: string) => string
) => {
  try {
    // Create user confirmation notification
    await supabase.from("driver_notifications").insert({
      driver_id: userId,
      title: t("complaintConfirmationTitle"),
      message: t("complaintConfirmationMessage").replace(
        "{issueType}",
        getIssueTypeLabel(complaintData.issue_type, t)
      ),
      notification_type: "complaint_confirmation",
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Get admin users
    const admins = await getAdminUsers();
    
    // Create admin notifications
    if (admins && admins.length > 0) {
      const adminNotifications = admins.map((admin) => ({
        driver_id: admin.id,
        title: t("newComplaintTitle"),
        message: t("newComplaintMessage")
          .replace("{userName}", userName)
          .replace(
            "{issueType}",
            getIssueTypeLabel(complaintData.issue_type, t)
          ),
        notification_type: "complaint",
        read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      await supabase.from("driver_notifications").insert(adminNotifications);
    } else {
      console.warn("No admin users found for notifications");
    }
  } catch (error) {
    console.error("Error creating notifications:", error);
    // Don't fail the whole process if notifications fail
  }
};

const getAdminUsers = async () => {
  // Try different methods to find admin users
  let { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (!admins || admins.length === 0) {
    const { data: adminsByType } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_type", "admin");

    if (adminsByType && adminsByType.length > 0) {
      admins = adminsByType;
    }
  }

  if (!admins || admins.length === 0) {
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

export const sendEmailNotification = async (
  complaintData: ComplaintData, 
  userId: string, 
  language: string
) => {
  try {
    // Get user profile for email
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

    // Try to send email (this might fail if function doesn't exist)
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
    console.error("Error in sendEmailNotification:", error);
  }
};
