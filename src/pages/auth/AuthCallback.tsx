// src/components/AuthCallback.tsx
import React, { useEffect, useState, useCallback } from "react";
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
  const { t } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verifyEmail = useCallback(async () => {
    try {
      // 1) Parse tokens from URL
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.substring(1));
      const token = query.get("token");
      const type = query.get("type");
      const access_token = hash.get("access_token");
      const refresh_token = hash.get("refresh_token");

      // 2) If this is the OTP flow, verify
      if (token && type) {
        await supabase.auth.verifyOtp({
          token_hash: token,
          type: type === "signup" ? "signup" : "recovery",
        });
      }
      // 3) Otherwise, set session from the hash fragment
      else if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }

      // 4) Retrieve session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw new Error("خطأ في الجلسة");
      if (!session) {
        // No session: email confirmed but not signed in
        toast.success(
          "تم التحقق من البريد الإلكتروني بنجاح. يرجى تسجيل الدخول."
        );
        return navigate("/login", {
          replace: true,
          state: {
            message: "تم التحقق من البريد الإلكتروني بنجاح. يرجى تسجيل الدخول.",
            type: "success",
            verifiedEmail: query.get("email") || hash.get("email"),
          },
        });
      }

      // 5) Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("لم يتم العثور على المستخدم");
      if (!user.email_confirmed_at)
        throw new Error("لم يتم تأكيد البريد الإلكتروني بعد");

      // 6) Read pending details from cookie
      const pendingDriverStr = Cookies.get("pendingDriverDetails");
      const pendingDriver = pendingDriverStr
        ? JSON.parse(pendingDriverStr)
        : null;
      const pendingCustomerStr = Cookies.get("pendingUserDetails");
      const pendingCustomer = pendingCustomerStr
        ? JSON.parse(pendingCustomerStr)
        : null;

      // 7) Check if a profile already exists
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .maybeSingle();

      // 8) If no profile row, insert based on user_type
      if (
        !profileData &&
        (!profileError || (profileError as any).code === "PGRST116")
      ) {
        if (pendingDriver?.user_type === "driver") {
          // a) Insert into profiles
          await supabase.from("profiles").insert({
            id: user.id,
            first_name: pendingDriver.firstName,
            last_name: pendingDriver.lastName,
            phone: pendingDriver.phone,
            email: pendingDriver.email,
            user_type: "driver",
            birth_date: pendingDriver.birth_date,
          });
          // b) Insert into drivers
          await supabase.from("drivers").insert({
            id: user.id,
            national_id: pendingDriver.nationalId,
            license_number: pendingDriver.licenseNumber,
            vehicle_info: pendingDriver.vehicleInfo,
            status: "pending",
            is_available: false,
            id_image: pendingDriver.idImageUrl,
            license_image: pendingDriver.licenseImageUrl,
          });
          // c) Assign driver role
          await supabase.from("user_roles").insert({
            user_id: user.id,
            role: "driver",
          });
        } else {
          // Default / customer flow: just insert in profiles
          await supabase.from("profiles").insert({
            id: user.id,
            first_name:
              pendingCustomer?.first_name ||
              user.user_metadata?.first_name ||
              "",
            last_name:
              pendingCustomer?.last_name || user.user_metadata?.last_name || "",
            phone: pendingCustomer?.phone || user.user_metadata?.phone || "",
            email: user.email!,
            user_type: "customer",
          });
        }
      }

      // 9) Clean up pending cookies
      Cookies.remove("pendingDriverDetails");
      Cookies.remove("pendingUserDetails");

      // 10) Success, sign out & redirect
      toast.success("تم التحقق من البريد الإلكتروني بنجاح");
      await supabase.auth.signOut();
      setTimeout(() => {
        window.location.href = "/login?verified=true";
      }, 100);
    } catch (e: any) {
      console.error("AuthCallback error:", e);
      setError(e.message || "حدث خطأ أثناء التحقق من البريد الإلكتروني");
      toast.error("فشل التحقق من البريد الإلكتروني");
      try {
        await supabase.auth.signOut();
      } catch {}
    } finally {
      setIsVerifying(false);
    }
  }, [navigate, t]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center">
          <Loader2 className="h-16 w-16 text-safedrop-primary animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-safedrop-primary">
            جاري التحقق من البريد الإلكتروني
          </h2>
          <p className="mt-2 text-gray-600">يرجى الانتظار...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow-lg rounded-xl p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-safedrop-primary">
            فشل التحقق
          </h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-6">
            <Button
              onClick={() => (window.location.href = "/login")}
              className="bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              العودة لتسجيل الدخول
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
