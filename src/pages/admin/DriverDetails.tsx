
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface DriverDetails {
  // Profile data
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date?: string;
  address?: string;
  email?: string;
  
  // Driver data
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
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
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
        // PGRST116 is "no rows returned" which is fine, just no driver data
        throw driverError;
      }
      
      // Get email from auth.users (this will be null in most cases as we don't have access to auth.users)
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

  const rejectDriver = async (permanent: boolean = false) => {
    if (!driver?.id) return;
    
    if (!permanent && !rejectionReason.trim()) {
      toast.error("يرجى إدخال سبب للرفض");
      return;
    }
    
    setProcessingAction(true);
    try {
      console.log("Rejecting driver:", driver.id, permanent ? "permanently" : "with message:", rejectionReason);
      
      if (permanent) {
        // Completely reject the driver
        console.log("Performing complete rejection");
        
        // First delete from drivers table
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
        
        // Finally delete from auth.users if we have access (this might fail without admin rights)
        try {
          const { error: authError } = await supabase.auth.admin.deleteUser(driver.id);
          if (authError) {
            console.error("Error deleting auth user (this is expected without admin rights):", authError);
          }
        } catch (e) {
          console.log("Could not delete auth user (this is expected without admin rights):", e);
        }
        
        toast.success("تم حذف حساب السائق بشكل نهائي");
      } else {
        // Just reject with a message
        console.log("Rejecting with message:", rejectionReason);
        
        const { error } = await supabase
          .from("drivers")
          .update({ status: "rejected", rejection_reason: rejectionReason })
          .eq("id", driver.id);
        
        if (error) {
          console.error("Error updating driver status:", error);
          throw error;
        }
        
        toast.success("تم رفض السائق مع إرسال رسالة");
        setRejectionDialogOpen(false);
        setRejectionReason("");
      }
      
      // Navigate back after a short delay
      setTimeout(() => navigate("/admin/driver-verification"), 1500);
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
                <span>{driver.first_name}</span>
              </div>
              
              <div>
                <span className="font-bold">اسم العائلة: </span>
                <span>{driver.last_name}</span>
              </div>
              
              <div>
                <span className="font-bold">البريد الإلكتروني: </span>
                <span>{driver.email || "غير متوفر"}</span>
              </div>
              
              <div>
                <span className="font-bold">رقم الهاتف: </span>
                <span>{driver.phone}</span>
              </div>
              
              <div>
                <span className="font-bold">تاريخ الميلاد: </span>
                <span>{driver.birth_date || "غير متوفر"}</span>
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
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="font-bold mb-1">سبب الرفض:</div>
              <div>{driver.rejection_reason || "لم يتم تحديد سبب"}</div>
            </div>
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
            variant="outline"
            className="bg-orange-50 hover:bg-orange-100 border-orange-200"
            onClick={() => setRejectionDialogOpen(true)}
            disabled={processingAction || driver.status === "rejected"}
          >
            <MessageSquare size={16} className="ml-1" /> رفض مع رسالة
          </Button>
          
          <Button 
            variant="destructive"
            onClick={() => rejectDriver(true)}
            disabled={processingAction}
          >
            <X size={16} className="ml-1" /> رفض تام
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إدخال سبب الرفض</DialogTitle>
            <DialogDescription>
              سيتم إرسال هذه الرسالة إلى السائق لإعلامه بسبب رفض طلبه
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="أدخل سبب الرفض هنا..."
            className="min-h-[120px]"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)} disabled={processingAction}>
              إلغاء
            </Button>
            <Button onClick={() => rejectDriver(false)} disabled={processingAction || !rejectionReason.trim()}>
              إرسال وتأكيد الرفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverDetails;
