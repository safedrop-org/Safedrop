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
  const { user, signOut } = useAuth();
  const [driverStatus, setDriverStatus] = useState({
    status: "pending",
    rejection_reason: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear any orphaned cookies/storage on mount
  useEffect(() => {
    Cookies.remove("pendingUserDetails");

    // Also clean up any driver file entries that don't match current user
    if (user?.id) {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("driverFiles_") && !key.includes(user.id)) {
          localStorage.removeItem(key);
        }
      }
    }
  }, [user?.id]);

  const fetchDriverStatus = async () => {
    if (!user?.id) {
      setError(
        "لم يتم العثور على بيانات تسجيل الدخول، يرجى تسجيل الدخول مرة أخرى"
      );
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Use the server function to check driver status
      const { data, error: rpcError } = await supabase.rpc(
        "get_driver_status_v3",
        {
          in_driver_id: user.id,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      // If the row simply doesn't exist yet, treat as pending
      if (!data?.success) {
        if (data.error?.includes("No driver record")) {
          setDriverStatus({ status: "pending", rejection_reason: null });
        } else {
          throw new Error(data.error || "فشل في جلب حالة السائق");
        }
      } else {
        setDriverStatus({
          status: data.status,
          rejection_reason: data.rejection_reason,
        });

        // Auto-redirect approved drivers
        if (data.status === "approved") {
          navigate("/driver/dashboard");
          return;
        }
      }
    } catch (err) {
      console.error("Error fetching driver status:", err);
      setError("حدث خطأ أثناء التحقق من حالة طلبك");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial + polling every 30s
  useEffect(() => {
    fetchDriverStatus();
    const interval = setInterval(fetchDriverStatus, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const clearAll = async () => {
    // Remove cookies + localStorage + sessionStorage
    Object.keys(Cookies.get()).forEach((c) => Cookies.remove(c, { path: "/" }));
    localStorage.clear();
    sessionStorage.clear();
  };

  const handleBackToLogin = async () => {
    await clearAll();
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-xl animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4" />
          <div className="h-6 bg-gray-200 rounded mb-4" />
          <div className="h-6 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 text-right">
            <p className="font-bold text-amber-800">خطأ في النظام</p>
            <p className="text-amber-700 mt-2">{error}</p>
          </div>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={fetchDriverStatus}
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

  // APPROVED
  if (driverStatus?.status === "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 text-right">
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

  // REJECTED
  if (driverStatus?.status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-right">
            <p className="font-bold text-red-800">تم رفض طلبك</p>
            <p className="text-red-700 mt-2">
              {driverStatus.rejection_reason || "لم يتم تحديد سبب للرفض"}
            </p>
          </div>
          <Button
            variant="destructive"
            className="w-full mb-2"
            onClick={signOut}
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
    );
  }

  // PENDING (no record yet or still under review)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center">
        <img
          src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png"
          alt="SafeDrop Logo"
          className="h-20 mx-auto mb-6"
        />
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 text-right">
          <div className="flex items-start">
            <Clock className="h-6 w-6 text-yellow-500 ml-3" />
            <div>
              <p className="font-bold text-yellow-800">حسابك قيد المراجعة</p>
              <p className="text-yellow-700 mt-2">
                شكرًا لتسجيلك في منصة سيف دروب. طلبك قيد المراجعة من قبل
                الإدارة. سنُعلمك عبر البريد فور انتهاء المراجعة.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ماذا يحدث الآن؟
        </h2>
        <ol className="text-right space-y-2 mb-6">
          <li>
            <strong>1.</strong> يقوم فريقنا بالتحقق من بياناتك
          </li>
          <li>
            <strong>2.</strong> قد يستغرق هذا ما بين 1–3 أيام عمل
          </li>
          <li>
            <strong>3.</strong> عند الموافقة، ستتم إعادة توجيهك تلقائيًا
          </li>
        </ol>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={fetchDriverStatus}
          >
            تحديث الحالة
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
};

const PendingApproval = () => (
  <LanguageProvider>
    <PendingApprovalContent />
  </LanguageProvider>
);

export default PendingApproval;
