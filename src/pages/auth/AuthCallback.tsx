import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const { t } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);

  // File upload handling for driver document images
  const processDriverFiles = async (userId) => {
    try {
      // Check if we have file data stored in localStorage
      const fileDataKey = `driverFiles_${userId}`;
      const fileDataStr = localStorage.getItem(fileDataKey);

      if (!fileDataStr) return null;

      const fileData = JSON.parse(fileDataStr);
      const uploadResults = {};

      // Process each file
      for (const fileType of ["id_image", "license_image"]) {
        if (fileData[fileType]) {
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
        }
      }

      // Clean up localStorage
      localStorage.removeItem(fileDataKey);

      return Object.keys(uploadResults).length > 0 ? uploadResults : null;
    } catch (error) {
      console.error("Error processing driver files:", error);
      return null;
    }
  };

  const verifyEmail = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      // Extract tokens from URL
      const tokenInQuery = queryParams.get("token");
      const typeInQuery = queryParams.get("type");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      // Try to verify with query token
      if (tokenInQuery && typeInQuery) {
        try {
          await supabase.auth.verifyOtp({
            token_hash: tokenInQuery,
            type: typeInQuery === "signup" ? "signup" : "recovery",
          });
        } catch (e) {
          // Continue even if verification fails
          console.warn("OTP verification warning:", e);
        }
      }
      // Try to set session with hash tokens
      else if (accessToken && refreshToken) {
        try {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        } catch (e) {
          // Continue even if setting session fails
          console.warn("Session setting warning:", e);
        }
      }

      // Check for current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw new Error("خطأ في الجلسة");

      // Handle no session case
      if (!session) {
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
            }
          } catch (e) {
            // Continue without email
          }
        }

        // Redirect to login with success message if we have an email
        if (pendingEmail) {
          toast.success(
            "تم التحقق من البريد الإلكتروني بنجاح. يرجى تسجيل الدخول."
          );
          navigate("/login", {
            replace: true,
            state: {
              message:
                "تم التحقق من البريد الإلكتروني بنجاح. يرجى تسجيل الدخول.",
              type: "success",
              verifiedEmail: pendingEmail,
            },
          });
          return;
        }

        throw new Error("لم يتم العثور على جلسة المستخدم");
      }

      // Get user details
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("لم يتم العثور على المستخدم");
      if (!user.email_confirmed_at)
        throw new Error("لم يتم تأكيد البريد الإلكتروني بعد");

      // Get user type from metadata
      let userTypeValue = user.user_metadata?.user_type;

      // Try to get pending details from cookie
      let pendingUserDetails = null;
      try {
        const cookieData = Cookies.get("pendingUserDetails");
        if (cookieData) pendingUserDetails = JSON.parse(cookieData);
      } catch (e) {
        console.warn("Error parsing pendingUserDetails cookie:", e);
        // Continue without pending details
      }

      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .maybeSingle();

      // Create profile if it doesn't exist
      if (!profileData && (!profileError || profileError.code === "PGRST116")) {
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

        try {
          const { error: insertProfileError } = await supabase
            .from("profiles")
            .insert(userMetadata);

          if (insertProfileError) throw insertProfileError;

          userTypeValue = userMetadata.user_type;

          // If the user is a driver, create the driver record
          if (userTypeValue === "driver") {
            // Process driver files if available
            const fileUrls = await processDriverFiles(user.id);

            // Create the driver record
            const driverData = {
              id: user.id,
              national_id: pendingUserDetails?.national_id || "",
              license_number: pendingUserDetails?.license_number || "",
              vehicle_info: pendingUserDetails?.vehicle_info || {},
              status: "pending",
              is_available: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...(fileUrls?.id_image && { id_image: fileUrls.id_image }),
              ...(fileUrls?.license_image && {
                license_image: fileUrls.license_image,
              }),
            };

            const { error: driverError } = await supabase
              .from("drivers")
              .insert(driverData);

            if (driverError) {
              console.error("Error creating driver record:", driverError);
            }

            // Add driver role
            const { error: roleError } = await supabase
              .from("user_roles")
              .insert({
                user_id: user.id,
                role: "driver",
                created_at: new Date().toISOString(),
              });

            if (roleError) {
              console.error("Error assigning driver role:", roleError);
            }
          }
        } catch (e) {
          console.error("Error creating profile:", e);
          // Continue even if profile creation fails
        }
      } else if (profileData) {
        userTypeValue = profileData.user_type;

        // Update email_verified if column exists
        try {
          await supabase
            .from("profiles")
            .update({
              email_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);
        } catch (e) {
          console.warn("Error updating email_verified:", e);
          // Continue even if update fails
        }
      }

      // Remove the pending user cookie
      Cookies.remove("pendingUserDetails");

      setUserType(userTypeValue);
      toast.success("تم التحقق من البريد الإلكتروني بنجاح");

      // Sign out and redirect
      await supabase.auth.signOut();

      // Use direct window location instead of navigate for more reliable redirect
      setTimeout(() => {
        window.location.href = "/login?verified=true";
      }, 100);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء التحقق من البريد الإلكتروني";
      setError(errorMessage);
      toast.error("حدث خطأ أثناء التحقق من البريد الإلكتروني");

      try {
        await supabase.auth.signOut();
      } catch (e) {
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
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center">
            <Loader2 className="h-16 w-16 text-safedrop-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary">
            جاري التحقق من البريد الإلكتروني
          </h2>
          <p className="text-gray-600">
            يرجى الانتظار بينما نتحقق من بريدك الإلكتروني...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary">
            فشل التحقق من البريد الإلكتروني
          </h2>
          <p className="text-gray-600">{error}</p>
          <div className="mt-6">
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              الذهاب إلى صفحة تسجيل الدخول
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
        <div className="mx-auto flex items-center justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-safedrop-primary">
          تم التحقق من البريد الإلكتروني
        </h2>
        <p className="text-gray-600">
          تم تأكيد بريدك الإلكتروني بنجاح. جاري تحويلك إلى صفحة تسجيل الدخول...
        </p>
      </div>
    </div>
  );
};

const AuthCallback = () => (
  <LanguageProvider>
    <AuthCallbackContent />
  </LanguageProvider>
);

export default AuthCallback;
