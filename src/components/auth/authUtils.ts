import { useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AUTH_CONSTANTS, UserData } from "./authConstants";
import Cookies from "js-cookie";

// Email validation utility
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc("check_email_exists", {
      email_to_check: email.toLowerCase(),
    });

    if (error) {
      console.error("Error checking email:", error);
      return false; // Allow registration on error
    }

    return data;
  } catch (error) {
    console.error("Error in email check:", error);
    return false;
  }
};

// Email duplicate error checking
export const isEmailDuplicateError = (errorMessage: string): boolean => {
  const duplicateKeywords = [
    "User already registered",
    "already been registered",
    "duplicate",
    "already exists",
    "already taken",
    "duplicate key",
  ];
  
  return duplicateKeywords.some(keyword => 
    errorMessage.toLowerCase().includes(keyword.toLowerCase())
  );
};

// Handle email duplicate error
export const useEmailDuplicateHandler = () => {
  return useCallback((setRegistrationError: (error: string) => void, setIsLoading: (loading: boolean) => void) => {
    setRegistrationError(AUTH_CONSTANTS.DUPLICATE_EMAIL_MESSAGE);
    toast.error(AUTH_CONSTANTS.DUPLICATE_EMAIL_TOAST);
    setIsLoading(false);
  }, []);
};

// Admin notification
export const sendAdminNotification = async (userData: UserData, userType: string = "customer") => {
  try {
    console.log(`Sending admin notification for new ${userType}:`, userData.email);

    const { data: emailResult, error: emailError } =
      await supabase.functions.invoke("send-admin-notification", {
        body: {
          userData: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            phone: userData.phone,
            user_type: userData.user_type,
            created_at: new Date().toISOString(),
          },
          userType,
          language: AUTH_CONSTANTS.CURRENT_LANGUAGE,
        },
      });

    if (emailError) {
      console.error("Error sending admin notification:", emailError);
    } else {
      console.log("Admin notification sent successfully:", emailResult);
    }
  } catch (error) {
    console.error("Error in sendAdminNotification:", error);
  }
};

// Cookie utilities
export const setPendingUserCookie = (userData: UserData) => {
  Cookies.set("pendingUserDetails", JSON.stringify(userData), {
    expires: AUTH_CONSTANTS.COOKIE_EXPIRES,
    secure: true,
    sameSite: "strict",
  });
};

export const getPendingUserFromCookie = (): UserData | null => {
  try {
    const pendingUserDetails = Cookies.get("pendingUserDetails");
    if (pendingUserDetails) {
      return JSON.parse(pendingUserDetails);
    }
  } catch (e) {
    // Continue without pending details
  }
  return null;
};

export const removePendingUserCookie = () => {
  Cookies.remove("pendingUserDetails");
};
