import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Cookies from "js-cookie";

// Constants
const COOKIE_PATH = { path: "/" };
const FILE_TYPES = ["id_image", "license_image"];
const STORAGE_FOLDERS = {
  id_image: "id-cards",
  license_image: "licenses"
};

// Helper functions
const getCurrentTimestamp = () => new Date().toISOString();

const cleanupPendingUserDetails = () => {
  Cookies.remove("pendingUserDetails", COOKIE_PATH);
};

const getPendingUserDetails = () => {
  try {
    const cookieData = Cookies.get("pendingUserDetails");
    return cookieData ? JSON.parse(cookieData) : null;
  } catch (e) {
    console.warn("Error parsing pendingUserDetails cookie:", e);
    return null;
  }
};

const createNavigationState = (messageKey, type = "success", additionalData = {}) => ({
  message: messageKey,
  type,
  ...additionalData,
});

const AuthCallbackContent = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);
  const [success, setSuccess] = useState(false);

  const convertDataUrlToFile = useCallback((dataUrl, fileName) => {
    const dataURLParts = dataUrl.split(",");
    const mime = dataURLParts[0].match(/:(.*?);/)[1];
    const bstr = atob(dataURLParts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
  }, []);

  const uploadFileToStorage = useCallback(async (file, fileType, userId) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}_${fileType}_${Date.now()}.${fileExt}`;
    const filePath = `${STORAGE_FOLDERS[fileType]}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("driver-documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(`Error uploading ${fileType}:`, uploadError);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("driver-documents")
      .getPublicUrl(filePath);

    return publicUrl;
  }, []);

  const processDriverFiles = useCallback(async (userId) => {
    try {
      const fileDataKey = `driverFiles_${userId}`;
      const fileDataStr = localStorage.getItem(fileDataKey);

      if (!fileDataStr) {
        return null;
      }

      const fileData = JSON.parse(fileDataStr);
      const uploadResults = {};

      for (const fileType of FILE_TYPES) {
        if (fileData[fileType]) {
          const file = convertDataUrlToFile(
            fileData[fileType].dataUrl,
            fileData[fileType].name
          );
          
          const publicUrl = await uploadFileToStorage(file, fileType, userId);
          if (publicUrl) {
            uploadResults[fileType] = publicUrl;
          }
        }
      }

      localStorage.removeItem(fileDataKey);
      return Object.keys(uploadResults).length > 0 ? uploadResults : null;
    } catch (error) {
      console.error("Error processing driver files:", error);
      return null;
    }
  }, [convertDataUrlToFile, uploadFileToStorage]);

  const createRelatedRecords = useCallback(async (userId) => {
    const currentTime = getCurrentTimestamp();
    
    try {
      // Insert role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "driver",
          created_at: currentTime,
        });

      if (roleError) {
        console.warn("Role creation warning:", roleError);
      }

      // Create earnings record
      const { error: earningsError } = await supabase
        .from("driver_earnings")
        .insert({
          driver_id: userId,
          amount: 0,
          status: "initial",
          created_at: currentTime,
          updated_at: currentTime,
        });

      if (earningsError) {
        console.warn("Earnings creation warning:", earningsError);
      }

      // Create welcome notification
      const { error: notificationError } = await supabase
        .from("driver_notifications")
        .insert({
          driver_id: userId,
          title: t("accountUnderReview") || "Account Under Review",
          message: t("thankYouForRegistering") || "Thank you for registering",
          notification_type: "welcome",
          created_at: currentTime,
          updated_at: currentTime,
        });

      if (notificationError) {
        console.warn("Notification creation warning:", notificationError);
      }
    } catch (error) {
      console.warn("Error creating related records:", error);
    }
  }, [t]);

  const createDriverRecord = useCallback(async (userId, driverData, fileUrls) => {
    try {
      const { data: result, error: functionError } = await supabase.rpc(
        "create_driver_with_related_records",
        {
          in_user_id: userId,
          in_national_id: driverData.national_id || "",
          in_license_number: driverData.license_number || "",
          in_vehicle_info: driverData.vehicle_info || {},
          in_id_image: fileUrls?.id_image || null,
          in_license_image: fileUrls?.license_image || null,
        }
      );

      if (functionError) {
        console.error("Error creating driver with function:", functionError);

        const currentTime = getCurrentTimestamp();
        const directDriverData = {
          id: userId,
          national_id: driverData.national_id || "",
          license_number: driverData.license_number || "",
          vehicle_info: driverData.vehicle_info || {},
          status: "pending",
          is_available: false,
          created_at: currentTime,
          updated_at: currentTime,
          ...(fileUrls?.id_image && { id_image: fileUrls.id_image }),
          ...(fileUrls?.license_image && { license_image: fileUrls.license_image }),
        };

        const { error: driverError } = await supabase
          .from("drivers")
          .insert(directDriverData);

        if (!driverError) {
          await createRelatedRecords(userId);
        }
      }

      return true;
    } catch (error) {
      console.error("Error in createDriverRecord:", error);
      return false;
    }
  }, [createRelatedRecords]);

  const handleVerificationTokens = useCallback(async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    const tokenInQuery = queryParams.get("token");
    const typeInQuery = queryParams.get("type");
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    let verificationResult = null;

    if (tokenInQuery && typeInQuery) {
      verificationResult = await supabase.auth.verifyOtp({
        token_hash: tokenInQuery,
        type: typeInQuery === "signup" ? "signup" : "recovery",
      });

      if (verificationResult.error) {
        console.error("OTP verification failed:", verificationResult.error);
        throw new Error(t("invalidToken") || "Invalid verification token");
      }
    } else if (accessToken && refreshToken) {
      verificationResult = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (verificationResult.error) {
        console.error("Session setup failed:", verificationResult.error);
        throw new Error(t("sessionExpired") || "Session expired");
      }
    }

    return { queryParams, hashParams, tokenInQuery, accessToken };
  }, [t]);

  const handleNoSessionCase = useCallback(async (queryParams, hashParams, tokenInQuery, accessToken) => {
    let pendingEmail = queryParams.get("email") || hashParams.get("email");

    if (!pendingEmail) {
      const pendingUserDetails = getPendingUserDetails();
      if (pendingUserDetails) {
        pendingEmail = pendingUserDetails.email;
      }
    }

    if (pendingEmail && (tokenInQuery || accessToken)) {
      cleanupPendingUserDetails();
      setSuccess(true);
      toast.success(t("emailVerifiedSuccess") || "Email verified successfully!");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: createNavigationState(
            t("emailVerified") || "Email verified successfully!",
            "success",
            { verifiedEmail: pendingEmail }
          ),
        });
      }, 2000);
      return true;
    }

    throw new Error(t("invalidToken") || "Invalid verification token");
  }, [navigate, t]);

  const createUserProfile = useCallback(async (user, pendingUserDetails) => {
    const currentTime = getCurrentTimestamp();
    const userMetadata = {
      id: user.id,
      first_name: pendingUserDetails?.first_name || user.user_metadata?.first_name || "",
      last_name: pendingUserDetails?.last_name || user.user_metadata?.last_name || "",
      phone: pendingUserDetails?.phone || user.user_metadata?.phone || "",
      email: user.email,
      user_type: pendingUserDetails?.user_type || user.user_metadata?.user_type || "customer",
      birth_date: pendingUserDetails?.birth_date || user.user_metadata?.birth_date || null,
      email_verified: true,
      created_at: currentTime,
      updated_at: currentTime,
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .insert(userMetadata);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return null;
    }

    return userMetadata;
  }, []);

  const finalizeVerification = useCallback(async (userTypeValue) => {
    setUserType(userTypeValue);
    setSuccess(true);
    toast.success(t("emailVerifiedSuccess") || "Email verified successfully!");

    setTimeout(async () => {
      await supabase.auth.signOut();
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: createNavigationState(
            t("emailVerified") || "Email verified successfully!",
            "success",
            { verified: true }
          ),
        });
      }, 500);
    }, 1500);
  }, [navigate, t]);

  const verifyEmail = useCallback(async () => {
    try {
      const { queryParams, hashParams, tokenInQuery, accessToken } = await handleVerificationTokens();

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error(t("sessionExpired") || "Session expired");
      }

      if (!session) {
        const handled = await handleNoSessionCase(queryParams, hashParams, tokenInQuery, accessToken);
        if (handled) return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(t("userNotFound") || "User not found");
      }

      const pendingUserDetails = getPendingUserDetails();
      let userTypeValue = user.user_metadata?.user_type || "customer";

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!profileData) {
        const userMetadata = await createUserProfile(user, pendingUserDetails);
        if (userMetadata) {
          userTypeValue = userMetadata.user_type;

          if (userTypeValue === "driver" && pendingUserDetails) {
            const fileUrls = await processDriverFiles(user.id);
            const driverData = {
              national_id: pendingUserDetails.national_id || "",
              license_number: pendingUserDetails.license_number || "",
              vehicle_info: pendingUserDetails.vehicle_info || {},
            };
            await createDriverRecord(user.id, driverData, fileUrls);
          }
        }
      } else {
        userTypeValue = profileData.user_type;
        try {
          await supabase
            .from("profiles")
            .update({
              email_verified: true,
              updated_at: getCurrentTimestamp(),
            })
            .eq("id", user.id);
        } catch (e) {
          console.warn("Email verified update failed:", e);
        }
      }

      cleanupPendingUserDetails();

      try {
        await supabase.rpc("verify_user_email", { user_id: user.id });
      } catch (e) {
        console.warn("RPC verify_user_email failed:", e);
      }

      await finalizeVerification(userTypeValue);
    } catch (err) {
      console.error("Verification error:", err);
      const errorMessage = err instanceof Error ? err.message : t("errorProcessingRequest") || "Error processing request";
      setError(errorMessage);
      toast.error(t("emailVerificationFailed") || "Email verification failed");

      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Error during sign out:", e);
      }
    } finally {
      setIsVerifying(false);
    }
  }, [
    handleVerificationTokens,
    handleNoSessionCase,
    createUserProfile,
    processDriverFiles,
    createDriverRecord,
    finalizeVerification,
    t
  ]);

  useEffect(() => {
    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(verifyEmail, 100);
    return () => clearTimeout(timer);
  }, [verifyEmail]);

  // Shared layout component to avoid JSX duplication
  const StatusLayout = ({ icon, title, message, additionalContent = null }) => (
    <div
      className={`min-h-screen flex flex-col justify-center items-center bg-gray-50 ${
        language === "ar" ? "rtl" : "ltr"
      }`}
    >
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
        <div className="mx-auto flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-safedrop-primary">
          {title}
        </h2>
        <p className="text-gray-600">{message}</p>
        {additionalContent}
      </div>
    </div>
  );

  if (isVerifying) {
    return (
      <StatusLayout
        icon={<Loader2 className="h-16 w-16 text-safedrop-primary animate-spin" />}
        title={t("verifyingEmail") || "Verifying Email"}
        message={t("pleaseWaitVerifyingEmail") || "Please wait while we verify your email..."}
      />
    );
  }

  if (error) {
    return (
      <StatusLayout
        icon={<AlertCircle className="h-16 w-16 text-red-500" />}
        title={t("emailVerificationFailed") || "Email Verification Failed"}
        message={error}
        additionalContent={
          <div className="mt-6">
            <Button
              onClick={() => {
                cleanupPendingUserDetails();
                navigate("/login");
              }}
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              {t("goToLoginPage") || "Go to Login Page"}
            </Button>
          </div>
        }
      />
    );
  }

  if (success) {
    return (
      <StatusLayout
        icon={<CheckCircle2 className="h-16 w-16 text-green-500" />}
        title={t("emailVerified") || "Email Verified"}
        message={t("emailVerifiedSuccess") || "Your email has been verified successfully!"}
        additionalContent={
          <p className="text-sm text-gray-500">
            {t("redirectingToLogin") || "Redirecting to login page..."}
          </p>
        }
      />
    );
  }

  return null;
};

const AuthCallback = () => (
  <LanguageProvider>
    <AuthCallbackContent />
  </LanguageProvider>
);

export default AuthCallback;
