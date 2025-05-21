import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Cookies from "js-cookie";

const PendingApprovalContent = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, signOut, clearAuthData } = useAuth();
  const [driverStatus, setDriverStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced session clearing function
  const clearAllSessionData = () => {
    // Clear cookies
    Object.keys(Cookies.get()).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });

    // Clear localStorage items
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
    } catch (e) {
      console.error("Error clearing sessionStorage:", e);
    }
  };

  useEffect(() => {
    // Check and clear redundant localStorage on component mount
    const pendingRegistration = localStorage.getItem(
      "pendingDriverRegistration"
    );
    if (pendingRegistration) {
      console.log(
        "Found pendingDriverRegistration in localStorage, clearing it"
      );
      localStorage.removeItem("pendingDriverRegistration");
    }
  }, []);

  useEffect(() => {
    const fetchDriverStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        setError(
          "لم يتم العثور على بيانات تسجيل الدخول، يرجى تسجيل الدخول مرة أخرى"
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Use the server-side function to get driver status
        const { data, error } = await supabase.rpc("get_driver_status_v2", {
          driver_id: user.id,
        });

        if (error) {
          console.error("Error fetching driver status:", error);
          throw error;
        }

        if (!data || !data.success) {
          throw new Error(data?.error || "Failed to get driver status");
        }

        setDriverStatus({
          status: data.status,
          rejection_reason: data.rejection_reason,
        });

        // Auto-redirect if approved
        if (data.status === "approved") {
          navigate("/driver/dashboard");
        }
      } catch (err) {
        console.error("Exception checking driver status:", err);

        // Set appropriate error message
        if (
          err.message?.includes("not found") ||
          err.message?.includes("No driver")
        ) {
          setError("لم يتم العثور على بيانات السائق");
        } else {
          setError("حدث خطأ أثناء التحقق من حالة طلبك");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverStatus();

    // Set up interval to check status
    const interval = setInterval(fetchDriverStatus, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      // First clear all local data
      clearAllSessionData();

      // Then sign out through auth provider
      const result = await signOut();

      // Ensure we always navigate to login
      navigate("/login");

      if (result?.success) {
        toast.success("تم تسجيل الخروج بنجاح");
      }
    } catch (error) {
      console.error("Error during sign out:", error);
      // Still navigate to login even if there's an error
      navigate("/login");
    }
  };

  const handleBackToLogin = async () => {
    try {
      // Clear all session data
      clearAllSessionData();

      // Force sign out to ensure clean state
      await supabase.auth.signOut();

      // Use window.location for a complete page refresh to clear any in-memory state
      window.location.href = "/login";
    } catch (error) {
      console.error("Error returning to login:", error);
      navigate("/login");
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleManualCheck = async () => {
    if (!user?.id) {
      toast.error(
        "لم يتم العثور على بيانات المستخدم، يرجى تسجيل الدخول مرة أخرى"
      );
      setTimeout(() => handleBackToLogin(), 2000);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc("get_driver_status_v2", {
        driver_id: user.id,
      });

      if (error) {
        throw error;
      }

      if (!data || !data.success) {
        throw new Error(data?.error || "Failed to get driver status");
      }

      setDriverStatus({
        status: data.status,
        rejection_reason: data.rejection_reason,
      });

      toast.success("تم تحديث الحالة بنجاح");

      if (data.status === "approved") {
        navigate("/driver/dashboard");
      }
    } catch (err) {
      console.error("Error manually checking status:", err);
      setError("فشل تحديث الحالة. يرجى المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-8 bg-white shadow-xl rounded-xl p-8 text-center">
          <div className="animate-pulse flex justify-center">
            <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-8 bg-white shadow-xl rounded-xl p-8 text-center">
          <div className="flex justify-center">
            <AlertTriangle className="h-16 w-16 text-amber-500" />
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6 text-right">
            <p className="font-bold text-amber-800">خطأ في النظام</p>
            <p className="text-amber-700 mt-2">{error}</p>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleRefresh}
            >
              إعادة المحاولة
            </Button>

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleBackToLogin}
            >
              العودة إلى صفحة تسجيل الدخول
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (driverStatus?.status === "approved") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-8 bg-white shadow-xl rounded-xl p-8 text-center">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6 text-right">
            <p className="font-bold text-green-800">تمت الموافقة على طلبك</p>
            <p className="text-green-700 mt-2">
              يمكنك الآن استخدام تطبيق سائق سيف دروب!
            </p>
          </div>

          <Button
            variant="default"
            className="w-full mt-4"
            onClick={() => navigate("/driver/dashboard")}
          >
            الذهاب إلى لوحة التحكم
          </Button>
        </div>
      </div>
    );
  }

  if (driverStatus?.status === "rejected") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-8 bg-white shadow-xl rounded-xl p-8 text-center">
          <div className="flex justify-center">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6 text-right">
            <p className="font-bold text-red-800">تم رفض طلبك</p>
            <p className="text-red-700 mt-2">
              {driverStatus.rejection_reason || "لم يتم تحديد سبب للرفض"}
            </p>
          </div>

          <div className="space-y-4 mt-4">
            <p className="text-gray-600">
              يمكنك إنشاء حساب جديد مع الأخذ بعين الاعتبار الملاحظات المذكورة
              أعلاه.
            </p>
          </div>

          <div className="space-y-4 mt-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleSignOut}
            >
              تسجيل الخروج
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleBackToLogin}
            >
              العودة إلى صفحة تسجيل الدخول
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white shadow-xl rounded-xl p-8 text-center">
        <div className="flex justify-center">
          <img
            src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png"
            alt="SafeDrop Logo"
            className="h-20"
          />
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6 text-right">
          <div className="flex items-start">
            <Clock className="h-6 w-6 text-yellow-500 ml-3" />
            <div>
              <p className="font-bold text-yellow-800 text-center">
                حسابك قيد المراجعة
              </p>
              <p className="text-yellow-700 mt-2 text-center">
                شكرًا لتسجيلك في منصة سيف دروب. يرجى العلم أن طلبك قيد المراجعة
                من قبل الإدارة. سيتم إشعارك عبر البريد الإلكتروني فور الانتهاء
                من مراجعة حسابك.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mt-6">
          ماذا يحدث الآن؟
        </h2>

        <div className="space-y-4 mt-4">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-safedrop-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              1
            </div>
            <p className="mr-4 text-right">يقوم فريقنا بالتحقق من بياناتك</p>
          </div>

          <div className="flex items-start">
            <div className="w-8 h-8 bg-safedrop-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              2
            </div>
            <p className="mr-4 text-right">قد يستغرق هذا ما بين 1-3 أيام عمل</p>
          </div>

          <div className="flex items-start">
            <div className="w-8 h-8 bg-safedrop-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              3
            </div>
            <p className="mr-4 text-center">
              ستستطيع العمل معنا بعد قبول طلب إنضمامك
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/")}
          >
            العودة للصفحة الرئيسية
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-safedrop-primary border-safedrop-primary hover:bg-safedrop-primary/10"
            onClick={handleManualCheck}
            disabled={isLoading}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{isLoading ? "جاري التحديث..." : "تحديث الحالة"}</span>
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleBackToLogin}
          >
            العودة إلى صفحة تسجيل الدخول
          </Button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>
            إذا كان لديك أي استفسار، يرجى التواصل مع{" "}
            <a
              href="mailto:support@safedrop.com"
              className="text-safedrop-gold hover:underline"
            >
              فريق الدعم
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const PendingApproval = () => {
  return (
    <LanguageProvider>
      <PendingApprovalContent />
    </LanguageProvider>
  );
};

export default PendingApproval;
