
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DriverInfoCard } from "@/components/admin/driver/DriverInfoCard";
import { DriverActions } from "@/components/admin/driver/DriverActions";
import { RejectionDialog } from "@/components/admin/driver/RejectionDialog";

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
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchDriverDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Verify admin privileges
      const isAdmin = localStorage.getItem('adminAuth') === 'true';
      if (!isAdmin) {
        toast.error("لا توجد صلاحية مسؤول. يرجى تسجيل الدخول كمسؤول أولاً.");
        navigate('/admin/login');
        return;
      }
      
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      
      if (profileError) throw profileError;
      
      // Get driver-specific data
      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (driverError && driverError.code !== 'PGRST116') {
        throw driverError;
      }
      
      let userEmail = null;
      try {
        const { data: userData } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", id)
          .single();
        userEmail = userData?.email;
      } catch (e) {
        console.log("Could not fetch user email:", e);
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

  const saveDriverStatus = async (status: string, rejectionReason: string | null = null) => {
    if (!driver?.id) return;
    
    try {
      // First ensure we're using admin auth
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth) {
        throw new Error("لا توجد صلاحية مسؤول. يرجى تسجيل الدخول كمسؤول أولاً.");
      }
      
      console.log("Attempting to update driver status to:", status);
      
      // Fetch admin user ID from localStorage to use for authentication check
      const adminEmail = localStorage.getItem('adminEmail');
      
      if (!adminEmail) {
        throw new Error("معلومات المسؤول غير متوفرة. يرجى إعادة تسجيل الدخول.");
      }
      
      // Ensure vehicle_info is properly structured
      const vehicleInfo = {
        make: driver.vehicle_info?.make || "",
        model: driver.vehicle_info?.model || "",
        year: driver.vehicle_info?.year || "",
        plateNumber: driver.vehicle_info?.plateNumber || ""
      };
      
      // First try the update using a direct insert with specific columns
      const updateData = {
        id: driver.id,
        status: status,
        rejection_reason: rejectionReason || null,
        national_id: driver.national_id || "",
        license_number: driver.license_number || "",
        vehicle_info: vehicleInfo
      };
      
      console.log("Updating driver data:", updateData);
      
      // Attempt the update
      const { data, error } = await supabase
        .from("drivers")
        .update({
          status: status,
          rejection_reason: rejectionReason
        })
        .eq("id", driver.id)
        .select();
      
      if (error) {
        console.error("Error updating driver status:", error);
        
        // If update fails, try upsert as a fallback
        console.log("Trying upsert as fallback...");
        
        const { data: upsertData, error: upsertError } = await supabase
          .from("drivers")
          .upsert(updateData)
          .select();
          
        if (upsertError) {
          console.error("Upsert fallback also failed:", upsertError);
          throw new Error(`فشل في تحديث حالة السائق. ${upsertError.message}`);
        }
        
        console.log("Upsert succeeded:", upsertData);
        return upsertData;
      }
      
      console.log("Update succeeded:", data);
      return data;
    } catch (error: any) {
      console.error("Driver status update failed:", error);
      throw error;
    }
  };

  const approveDriver = async () => {
    if (!driver?.id) return;
    
    setProcessingAction(true);
    try {
      await saveDriverStatus("approved");
      
      toast.success("تم قبول السائق بنجاح");
      
      // Update local state
      setDriver(prev => prev ? { ...prev, status: "approved", rejection_reason: null } : null);
      
      // Navigate back after a short delay
      setTimeout(() => navigate("/admin/driver-verification"), 1500);
    } catch (error: any) {
      console.error("Error approving driver:", error);
      toast.error(error.message || "فشل في تحديث حالة السائق. الرجاء التأكد من صلاحيات المسؤول الخاصة بك");
    } finally {
      setProcessingAction(false);
    }
  };

  const rejectDriver = async () => {
    if (!driver?.id) return;
    
    if (!rejectionReason.trim()) {
      toast.error("يرجى كتابة سبب الرفض");
      return;
    }
    
    setProcessingAction(true);
    try {
      await saveDriverStatus("rejected", rejectionReason);
      
      setShowRejectDialog(false);
      
      toast.success("تم رفض السائق بنجاح");
      
      // Update local state
      setDriver(prev => prev ? { ...prev, status: "rejected", rejection_reason: rejectionReason } : null);
      
      // Navigate back after a short delay
      setTimeout(() => navigate("/admin/driver-verification"), 1500);
    } catch (error: any) {
      console.error("Error rejecting driver:", error);
      toast.error(error.message || "فشل في تحديث حالة السائق. الرجاء التأكد من صلاحيات المسؤول الخاصة بك");
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
        
        <DriverInfoCard {...driver} />
        
        <DriverActions 
          status={driver.status}
          onApprove={approveDriver}
          onReject={() => setShowRejectDialog(true)}
          processingAction={processingAction}
        />
      </Card>
      
      <RejectionDialog 
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onConfirm={rejectDriver}
        onCancel={() => {
          setShowRejectDialog(false);
          setRejectionReason("");
        }}
        rejectionReason={rejectionReason}
        onReasonChange={setRejectionReason}
        processing={processingAction}
      />
    </div>
  );
};

export default DriverDetails;
