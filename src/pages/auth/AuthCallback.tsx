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

const AuthCallbackContent = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // File upload handling for driver document images
  const processDriverFiles = async (userId) => {
    try {
      // Check if we have file data stored in localStorage
      const fileDataKey = `driverFiles_${userId}`;
      const fileDataStr = localStorage.getItem(fileDataKey);

      if (!fileDataStr) {
        console.log("No file data found in localStorage");
        return null;
      }

      console.log("Found file data in localStorage, processing...");

      const fileData = JSON.parse(fileDataStr);
      const uploadResults = {};

      // Process each file
      for (const fileType of ["id_image", "license_image"]) {
        if (fileData[fileType]) {
          console.log(`Processing ${fileType}...`);

          // Convert data URL back to file
          const dataURLParts = fileData[fileType].dataUrl.split(",");
          const mime = dataURLParts[0].match(/:(.*?);/)[1];
          const bstr = atob(dataURLParts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);

          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }

          const file = new File([u8arr], fileData[fileType].name, {
            type: mime,
          });

          // Upload to Supabase
          const fileExt = file.name.split(".").pop();
          const fileName = `${userId}_${fileType}_${Date.now()}.${fileExt}`;
          const filePath = `${
            fileType === "id_image" ? "id-cards" : "licenses"
          }/${fileName}`;

          console.log(`Uploading ${fileType} to ${filePath}...`);

          const { error: uploadError } = await supabase.storage
            .from("driver-documents")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error(`Error uploading ${fileType}:`, uploadError);
            continue;
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("driver-documents").getPublicUrl(filePath);

          uploadResults[fileType] = publicUrl;
          console.log(`Successfully uploaded ${fileType}, URL: ${publicUrl}`);
        }
      }

      // Clean up localStorage
      localStorage.removeItem(fileDataKey);
      console.log("Removed file data from localStorage");

      return Object.keys(uploadResults).length > 0 ? uploadResults : null;
    } catch (error) {
      console.error("Error processing driver files:", error);
      return null;
    }
  };

  // Create driver record with all related data
  const createDriverRecord = async (userId, driverData, fileUrls) => {
    try {
      console.log("Creating driver record using the function");
      // Try to use the function first (which bypasses RLS)
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
        setDebugInfo({
          stage: "driver_function_call",
          error: functionError,
        });

        // Fallback to direct insertion
        console.log("Falling back to direct driver record insertion");
        const directDriverData = {
          id: userId,
          national_id: driverData.national_id || "",
          license_number: driverData.license_number || "",
          vehicle_info: driverData.vehicle_info || {},
          status: "pending",
          is_available: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...(fileUrls?.id_image && { id_image: fileUrls.id_image }),
          ...(fileUrls?.license_image && {
            license_image: fileUrls.license_image,
          }),
        };

        // Insert driver record
        const { error: driverError } = await supabase
          .from("drivers")
          .insert(directDriverData);

        if (driverError) {
          console.error("Error inserting driver record directly:", driverError);
          setDebugInfo({
            stage: "driver_direct_insert",
            error: driverError,
            data: directDriverData,
          });
          // Don't throw error - continue with verification
          console.warn(
            "Driver record creation failed, but continuing with email verification"
          );
        } else {
          // Insert role
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
              user_id: userId,
              role: "driver",
              created_at: new Date().toISOString(),
            });

          if (roleError) {
            console.warn("Error creating driver role:", roleError);
          }

          // Create earnings record
          try {
            await supabase.from("driver_earnings").insert({
              driver_id: userId,
              amount: 0,
              status: "initial",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } catch (earningsError) {
            console.warn(
              "Error creating initial earnings record:",
              earningsError
            );
          }

          // Create welcome notification
          try {
            await supabase.from("driver_notifications").insert({
              driver_id: userId,
              title: t("accountUnderReview"),
              message: t("thankYouForRegistering"),
              notification_type: "welcome",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } catch (notificationError) {
            console.warn(
              "Error creating welcome notification:",
              notificationError
            );
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error in createDriverRecord:", error);
      return false;
    }
  };

  const verifyEmail = useCallback(async () => {
    try {
      console.log("Starting email verification process...");

      const queryParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      // Extract tokens from URL
      const tokenInQuery = queryParams.get("token");
      const typeInQuery = queryParams.get("type");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      // Try to verify with query token
      if (tokenInQuery && typeInQuery) {
        console.log("Found token in query, attempting to verify OTP...");
        try {
          const { error: otpError } = await supabase.auth.verifyOtp({
            token_hash: tokenInQuery,
            type: typeInQuery === "signup" ? "signup" : "recovery",
          });

          if (otpError) {
            console.error("OTP verification failed:", otpError);
            throw new Error(t("invalidToken"));
          }

          console.log("OTP verification successful");
        } catch (e) {
          console.error("OTP verification error:", e);
          throw e;
        }
      }
      // Try to set session with hash tokens
      else if (accessToken && refreshToken) {
        console.log("Found tokens in hash, attempting to set session...");
        try {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error("Session setting failed:", sessionError);
            throw new Error(t("sessionExpired"));
          }

          console.log("Session set successfully");
        } catch (e) {
          console.error("Session setting error:", e);
          throw e;
        }
      }

      // Check for current session
      console.log("Checking for current session...");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error(t("sessionExpired"));
      }

      // Handle no session case
      if (!session) {
        console.log("No session found, checking for email in URL or cookie");
        const emailFromUrl =
          queryParams.get("email") || hashParams.get("email");

        // Try to get email from cookie if not in URL
        let pendingEmail = emailFromUrl;
        if (!pendingEmail) {
          try {
            const pendingUserDetails = Cookies.get("pendingUserDetails");
            if (pendingUserDetails) {
              const details = JSON.parse(pendingUserDetails);
              pendingEmail = details.email;
              console.log(
                "Found email in pendingUserDetails cookie:",
                pendingEmail
              );
            }
          } catch (e) {
            console.warn("Error parsing pendingUserDetails cookie:", e);
            // Continue without email
          }
        }

        // Redirect to login with success message if we have an email
        if (pendingEmail) {
          console.log("No session but have email, redirecting to login");
          setSuccess(true);
          toast.success(t("emailVerifiedSuccess"));

          // Remove cookie
          console.log("Removing pendingUserDetails cookie");
          Cookies.remove("pendingUserDetails", { path: "/" });

          setTimeout(() => {
            navigate("/login", {
              replace: true,
              state: {
                message: t("emailVerifiedSuccess"),
                type: "success",
                verifiedEmail: pendingEmail,
              },
            });
          }, 2000);
          return;
        }

        console.error("No session and no email found");
        throw new Error(t("invalidToken"));
      }

      // Get user details
      console.log("Session found, getting user details");
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User error:", userError);
        throw new Error(t("userNotFound"));
      }

      console.log(
        "User found:",
        user.id,
        "Email confirmed at:",
        user.email_confirmed_at
      );

      if (!user.email_confirmed_at) {
        console.error("Email not confirmed yet");
        throw new Error(t("emailNotConfirmed"));
      }

      // Get user type from metadata
      let userTypeValue = user.user_metadata?.user_type;
      console.log("User type from metadata:", userTypeValue);

      // Try to get pending details from cookie
      let pendingUserDetails = null;
      try {
        const cookieData = Cookies.get("pendingUserDetails");
        if (cookieData) {
          pendingUserDetails = JSON.parse(cookieData);
          console.log("Found pendingUserDetails:", pendingUserDetails);
        }
      } catch (e) {
        console.warn("Error parsing pendingUserDetails cookie:", e);
        // Continue without pending details
      }

      // Check if profile exists
      console.log("Checking if profile exists");
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      console.log("Profile check result:", profileData, profileError);

      // Create profile if it doesn't exist
      if (!profileData && (!profileError || profileError.code === "PGRST116")) {
        console.log("Profile doesn't exist, creating it");
        const userMetadata = {
          id: user.id,
          first_name:
            pendingUserDetails?.first_name ||
            user.user_metadata?.first_name ||
            "",
          last_name:
            pendingUserDetails?.last_name ||
            user.user_metadata?.last_name ||
            "",
          phone: pendingUserDetails?.phone || user.user_metadata?.phone || "",
          email: user.email,
          user_type:
            pendingUserDetails?.user_type ||
            user.user_metadata?.user_type ||
            "customer",
          birth_date:
            pendingUserDetails?.birth_date ||
            user.user_metadata?.birth_date ||
            null,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log("Inserting profile with data:", userMetadata);
        try {
          const { error: insertProfileError } = await supabase
            .from("profiles")
            .insert(userMetadata);

          if (insertProfileError) {
            console.error("Error inserting profile:", insertProfileError);
            // Don't throw error, continue with verification
            console.warn(
              "Profile creation failed, but email verification succeeded"
            );
          }

          userTypeValue = userMetadata.user_type;
          console.log(
            "Profile created successfully, user type:",
            userTypeValue
          );

          // If the user is a driver, create the driver record
          if (userTypeValue === "driver") {
            console.log("User is a driver, creating driver record");

            // Process driver files if available
            console.log("Processing driver files");
            const fileUrls = await processDriverFiles(user.id);
            console.log("File upload results:", fileUrls);

            // Prepare the driver data
            const driverData = {
              national_id: pendingUserDetails?.national_id || "",
              license_number: pendingUserDetails?.license_number || "",
              vehicle_info: pendingUserDetails?.vehicle_info || {},
            };

            // Create driver record and related data
            const driverCreated = await createDriverRecord(
              user.id,
              driverData,
              fileUrls
            );

            if (!driverCreated) {
              console.error("Failed to create driver record");
              // Don't throw error, continue with verification
              console.warn(
                "Driver record creation failed, but email verification succeeded"
              );
            } else {
              console.log("Driver record created successfully");
            }
          }
        } catch (e) {
          console.error("Error creating profile:", e);
          // Continue even if profile creation fails
          console.warn(
            "Profile creation failed, but email verification succeeded"
          );
        }
      } else if (profileData) {
        console.log("Profile exists, updating email_verified");
        userTypeValue = profileData.user_type;

        // Update email_verified
        try {
          console.log("Updating email_verified to true");
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              email_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

          if (updateError) {
            console.error("Error updating email_verified:", updateError);
          } else {
            console.log("email_verified updated successfully");
          }
        } catch (e) {
          console.warn("Error updating email_verified:", e);
          // Continue even if update fails
        }
      }

      // Call the verify_user_email RPC function
      try {
        const { data: verifyResult, error: verifyError } = await supabase.rpc(
          "verify_user_email",
          {
            user_id: user.id,
          }
        );

        if (verifyError) {
          console.warn("Error calling verify_user_email:", verifyError);
        } else {
          console.log("verify_user_email result:", verifyResult);
        }
      } catch (e) {
        console.warn("Exception calling verify_user_email:", e);
      }

      // Remove the pending user cookie
      console.log("Removing pendingUserDetails cookie");
      Cookies.remove("pendingUserDetails", { path: "/" });

      setUserType(userTypeValue);
      setSuccess(true);
      toast.success(t("emailVerifiedSuccess"));

      // Sign out and redirect
      console.log("Signing out user");
      await supabase.auth.signOut();

      // Use direct window location instead of navigate for more reliable redirect
      console.log("Redirecting to login page");
      setTimeout(() => {
        window.location.href = "/login?verified=true";
      }, 2000);
    } catch (err) {
      console.error("Verification error:", err);
      const errorMessage =
        err instanceof Error ? err.message : t("errorProcessingRequest");
      setError(errorMessage);
      toast.error(t("emailVerificationFailed"));

      try {
        console.log("Signing out after error");
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Error during sign out:", e);
        // Ignore sign out errors
      }
    } finally {
      setIsVerifying(false);
    }
  }, [navigate, t]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  if (isVerifying) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center bg-gray-50 ${
          language === "ar" ? "rtl" : "ltr"
        }`}
      >
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center">
            <Loader2 className="h-16 w-16 text-safedrop-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary">
            {t("verifyingEmail")}
          </h2>
          <p className="text-gray-600">{t("pleaseWaitVerifyingEmail")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center bg-gray-50 ${
          language === "ar" ? "rtl" : "ltr"
        }`}
      >
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary">
            {t("emailVerificationFailed")}
          </h2>
          <p className="text-gray-600">{error}</p>
          {debugInfo && (
            <div
              className={`bg-red-50 p-3 rounded mt-4 text-xs overflow-auto max-h-32 ${
                language === "ar" ? "text-right" : "text-left"
              }`}
            >
              <p className="font-semibold text-red-800">Debug Info:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
          <div className="mt-6">
            <Button
              onClick={() => {
                Cookies.remove("pendingUserDetails", { path: "/" });
                navigate("/login");
              }}
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              {t("goToLoginPage")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center bg-gray-50 ${
          language === "ar" ? "rtl" : "ltr"
        }`}
      >
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary">
            {t("emailVerified")}
          </h2>
          <p className="text-gray-600">{t("emailVerifiedSuccess")}</p>
        </div>
      </div>
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
