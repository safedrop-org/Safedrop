import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MailIcon, Loader2 } from "lucide-react";
import { 
  CenteredPageLayout, 
  LoadingSpinner, 
  VerificationSuccess 
} from "@/components/auth/AuthLayout";
import { 
  getPendingUserFromCookie, 
  removePendingUserCookie 
} from "@/components/auth/authUtils";

const EmailVerificationContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Initialize component state
  const initializeState = useCallback(() => {
    // Try to get email from location state first
    if (location.state?.email) {
      setEmail(location.state.email);
      setIsVerifying(false);
      return;
    }

    // Try to get email from cookie
    const pendingUserDetails = getPendingUserFromCookie();
    if (pendingUserDetails?.email) {
      setEmail(pendingUserDetails.email);
    }

    setIsVerifying(false);
  }, [location.state]);

  // Check verification status
  const checkVerificationStatus = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email_confirmed_at) return;

      // Email is verified
      setVerified(true);
      setEmail(user.email);

      // Get user type from metadata
      const userTypeValue = user.user_metadata?.user_type || null;
      setUserType(userTypeValue);

      // Check for profile and create if missing
      await ensureProfileExists(user.id, user);
    } catch (error) {
      // Continue without verification
    }
  }, []);

  // Ensure profile exists
  const ensureProfileExists = async (userId: string, user: unknown) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", userId)
        .maybeSingle();

      if (profileData) {
        setUserType(profileData.user_type);

        // Try to update email_verified flag
        try {
          await supabase
            .from("profiles")
            .update({ email_verified: true })
            .eq("id", userId);
        } catch (e) {
          // Ignore errors updating email_verified
        }

        return;
      }

      // Profile doesn't exist, create one
      if (!profileData && (!profileError || profileError.code === "PGRST116")) {
        // Get pending details from cookie
        const pendingUserDetails = getPendingUserFromCookie();

        const userWithMetadata = user as { user_metadata?: Record<string, string> };
        const userMetadata = {
          id: userId,
          first_name: pendingUserDetails?.first_name || userWithMetadata.user_metadata?.first_name || "",
          last_name: pendingUserDetails?.last_name || userWithMetadata.user_metadata?.last_name || "",
          phone: pendingUserDetails?.phone || userWithMetadata.user_metadata?.phone || "",
          user_type: pendingUserDetails?.user_type || userWithMetadata.user_metadata?.user_type || "customer",
        };

        try {
          await supabase.from("profiles").insert(userMetadata);
          setUserType(userMetadata.user_type);
          removePendingUserCookie();
        } catch (e) {
          // Ignore profile creation errors
        }
      }
    } catch (error) {
      // Ignore profile check errors
    }
  };

  // Initialize state and check verification on mount
  useEffect(() => {
    initializeState();
    checkVerificationStatus();
  }, [initializeState, checkVerificationStatus]);

  // Handle resend verification
  const handleResendVerification = async () => {
    if (!email || isResending) return;

    setIsResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      toast.success("تم إرسال رابط التحقق مرة أخرى إلى بريدك الإلكتروني");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء إعادة إرسال التحقق";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  // Navigate to login
  const handleGoToLogin = () => navigate("/login");

  if (isVerifying) {
    return <LoadingSpinner message="جاري التحقق من حالة التأكيد..." />;
  }

  if (verified && (userType === "driver" || userType === "customer")) {
    return <VerificationSuccess userType={userType!} onGoToLogin={handleGoToLogin} />;
  }

  return (
    <CenteredPageLayout>
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <MailIcon className="h-8 w-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-safedrop-primary">
        تحقق من بريدك الإلكتروني
      </h2>
      <p className="text-gray-600 mt-4">
        {email
          ? `لقد أرسلنا رسالة تأكيد إلى ${email}. يرجى النقر على الرابط الموجود في الرسالة لتأكيد حسابك.`
          : "لقد أرسلنا رسالة تأكيد إلى بريدك الإلكتروني. يرجى النقر على الرابط الموجود في الرسالة لتأكيد حسابك."}
      </p>

      <div className="space-y-3 mt-6">
        <Button
          onClick={handleResendVerification}
          className="w-full bg-safedrop-primary hover:bg-safedrop-primary/90"
          disabled={isResending || !email}
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري إعادة الإرسال...
            </>
          ) : (
            "إعادة إرسال رابط التحقق"
          )}
        </Button>

        <Button
          onClick={handleGoToLogin}
          className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
        >
          العودة لصفحة تسجيل الدخول
        </Button>
      </div>
    </CenteredPageLayout>
  );
};

const EmailVerification = () => {
  return (
    <LanguageProvider>
      <EmailVerificationContent />
    </LanguageProvider>
  );
};

export default EmailVerification;
