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
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  // Clear all cookies and local storage to prevent auth issues
  const clearAuthData = useCallback(() => {
    // Clear all cookies
    Object.keys(Cookies.get()).forEach((cookieName) => {
      Cookies.remove(cookieName, { path: "/" });
    });

    // Clear localStorage items related to auth
    localStorage.removeItem("pendingDriverRegistration");
    localStorage.removeItem("pendingDriverData");

    // Clear Supabase tokens from localStorage
    if (window.localStorage) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("sb-"))
        .forEach((key) => localStorage.removeItem(key));
    }

    // Clear any session storage
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
    }
  }, []);

  const verifyEmail = useCallback(async () => {
    try {
      // Clear any existing auth data first to prevent conflicts
      clearAuthData();

      const queryParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      // Extract tokens from URL
      const tokenInQuery = queryParams.get("token");
      const typeInQuery = queryParams.get("type");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const emailFromUrl = queryParams.get("email") || hashParams.get("email");

      // Try to verify with query token
      if (tokenInQuery && typeInQuery) {
        try {
          await supabase.auth.verifyOtp({
            token_hash: tokenInQuery,
            type: typeInQuery === "signup" ? "signup" : "recovery",
          });
        } catch (e) {
          console.warn("OTP verification failed, continuing with flow:", e);
          // Continue even if verification fails, as the token may have already been used
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
          console.warn("Session setting failed, continuing with flow:", e);
          // Continue even if setting session fails
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
            console.warn("Failed to parse pendingUserDetails cookie:", e);
          }
        }

        // Redirect to login with success message if we have an email
        if (pendingEmail) {
          toast.success(
            "تم التحقق من البريد الإلكتروني بنجاح. يرجى تسجيل الدخول."
          );

          // Clean up any cookies before redirecting
          clearAuthData();

          // Add verified email to URL for auto-fill
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
        console.warn("Failed to parse pendingUserDetails cookie:", e);
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
          user_type:
            pendingUserDetails?.user_type ||
            user.user_metadata?.user_type ||
            "customer",
          email: user.email,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        try {
          await supabase.from("profiles").insert(userMetadata);
          userTypeValue = userMetadata.user_type;
        } catch (e) {
          console.warn("Profile creation failed, continuing with flow:", e);
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
          console.warn("Profile update failed, continuing with flow:", e);
        }
      }

      setUserType(userTypeValue);

      // Remove all cookies and session data
      clearAuthData();

      // Sign out and redirect
      await supabase.auth.signOut();

      toast.success("تم التحقق من البريد الإلكتروني بنجاح");

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
        clearAuthData();
      } catch (e) {
        console.warn("Sign out during error handling failed:", e);
      }
    } finally {
      setIsVerifying(false);
    }
  }, [navigate, t, clearAuthData]);

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
              onClick={() => {
                clearAuthData();
                navigate("/login");
              }}
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              الذهاب إلى صفحة تسجيل الدخول
            </Button>
          </div>
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
