
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DriverDetails {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date?: string;
  address?: string;
  email?: string;
  national_id?: string;
  license_number?: string;
  license_image?: string;
  vehicle_info?: {
    make?: string;
    model?: string;
    year?: string;
    plateNumber?: string;
  };
  status?: string;
  rejection_reason?: string;
}

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<DriverDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);

  const fetchDriverDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      
      if (profileError) throw profileError;
      
      // Fetch driver specific data
      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", id)
        .single();
      
      if (driverError && driverError.code !== 'PGRST116') {
        throw driverError;
      }
      
      // Get email from auth.users
      let userEmail = null;
      try {
        const { data: authUserData } = await supabase.auth.admin.getUserById(id);
        userEmail = authUserData?.user?.email;
      } catch (e) {
        console.log("Could not fetch user email from auth:", e);
      }
      
      setDriver({
        ...profileData,
        ...(driverData || {}),
        email: userEmail || profileData?.email,
      });
    } catch (error) {
      console.error("Error fetching driver details:", error);
      toast.error("خطأ في جلب بيانات السائق");
    } finally {
      setLoading(false);
    }
  };

  const approveDriver = async () => {
    if (!driver?.id) return;
    
    setProcessingAction(true);
    try {
      const { error } = await supabase
        .from("drivers")
        .update({ status: "approved", rejection_reason: null })
        .eq("id", driver.id);
      
      if (error) throw error;
      
      toast.success("تم قبول السائق بنجاح");
      // Refresh data
      fetchDriverDetails();
      // Navigate back after a short delay
      setTimeout(() => navigate("/admin/driver-verification"), 1500);
    } catch (error) {
      console.error("Error approving driver:", error);
      toast.error("حدث خطأ أثناء قبول السائق");
    } finally {
      setProcessingAction(false);
    }
  };

  const rejectDriver = async () => {
    if (!driver?.id) return;
    
    setProcessingAction(true);
    try {
      // Delete from drivers table first
      const { error: driverError } = await supabase
        .from("drivers")
        .delete()
        .eq("id", driver.id);
      
      if (driverError) {
        console.error("Error deleting driver record:", driverError);
        throw driverError;
      }
      
      // Then delete from profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", driver.id);
      
      if (profileError) {
        console.error("Error deleting profile record:", profileError);
        throw profileError;
      }
      
      toast.success("تم حذف حساب السائق بشكل نهائي");
      
      // Wait a moment to ensure the toast is visible
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back after showing the success toast
      navigate("/admin/driver-verification");
    } catch (error) {
      console.error("Error rejecting driver:", error);
      toast.error("حدث خطأ أثناء رفض السائق");
    } finally {
      setProcessingAction(false);
    }
  };

  useEffect(() => {
    fetchDriverDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-xl">جاري تحميل البيانات...</div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="p-6">
        <div className="text-xl text-red-600">لم يتم العثور على بيانات السائق</div>
        <Button className="mt-4" onClick={() => navigate("/admin/driver-verification")}>
          العودة
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Button variant="outline" className="mb-6" onClick={() => navigate("/admin/driver-verification")}>
        العودة
      </Button>
      
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">تفاصيل السائق</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="font-bold">الاسم الأول: </span>
                <span>{driver.first_name || "غير متوفر"}</span>
              </div>
              
              <div>
                <span className="font-bold">اسم العائلة: </span>
                <span>{driver.last_name || "غير متوفر"}</span>
              </div>
              
              <div>
                <span className="font-bold">البريد الإلكتروني: </span>
                <span>{driver.email || "غير متوفر"}</span>
              </div>
              
              <div>
                <span className="font-bold">رقم الهاتف: </span>
                <span>{driver.phone || "غير متوفر"}</span>
              </div>
              
              <div>
                <span className="font-bold">تاريخ الميلاد: </span>
                <span>{driver.birth_date || "غير متوفر"}</span>
              </div>
              
              <div>
                <span className="font-bold">العنوان: </span>
                <span>{driver.address || "غير متوفر"}</span>
              </div>
              
              <div>
                <span className="font-bold">الحالة: </span>
                <span className={
                  driver.status === "approved" ? "text-green-600" :
                  driver.status === "rejected" ? "text-red-600" :
                  driver.status === "pending" ? "text-yellow-600" :
                  "text-gray-600"
                }>
                  {driver.status === "approved" ? "مقبول" :
                   driver.status === "rejected" ? "مرفوض" :
                   driver.status === "pending" ? "قيد المراجعة" :
                   "غير محدد"}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="font-bold">رقم الهوية: </span>
                <span>{driver.national_id || "غير متوفر"}</span>
              </div>
              
              <div>
                <span className="font-bold">رقم الرخصة: </span>
                <span>{driver.license_number || "غير متوفر"}</span>
              </div>
              
              <div>
                <span className="font-bold">نوع السيارة: </span>
                <span>{driver.vehicle_info?.make || "غير متوفر"}</span>
              </div>
              
              <div>
                <span className="font-bold">موديل السيارة: </span>
                <span>{driver.vehicle_info?.model || "غير متوفر"}</span>
              </div>
              
              <div>
                <span className="font-bold">سنة الصنع: </span>
                <span>{driver.vehicle_info?.year || "غير متوفر"}</span>
              </div>
              
              <div>
                <span className="font-bold">رقم اللوحة: </span>
                <span>{driver.vehicle_info?.plateNumber || "غير متوفر"}</span>
              </div>
            </div>
          </div>
          
          {driver.status === "rejected" && driver.rejection_reason && (
            <Alert className="mt-4 bg-red-50 border-red-200 text-right">
              <div className="font-bold mb-1">سبب الرفض:</div>
              <AlertDescription>{driver.rejection_reason}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center gap-4 pt-4">
          <Button 
            variant="outline" 
            className="bg-green-50 hover:bg-green-100 border-green-200"
            onClick={approveDriver}
            disabled={processingAction || driver.status === "approved"}
          >
            <Check size={16} className="ml-1" /> قبول
          </Button>
          
          <Button 
            variant="destructive"
            onClick={rejectDriver}
            disabled={processingAction}
          >
            <X size={16} className="ml-1" /> رفض تام
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DriverDetails;
