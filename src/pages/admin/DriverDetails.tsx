
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
      // First, check if the admin has the correct role
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('role', 'admin')
        .maybeSingle();
        
      if (!adminRole) {
        console.warn("User doesn't have admin role in user_roles table");
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
      
      // Ensure vehicle_info is properly structured
      const vehicleInfo = {
        make: driver.vehicle_info?.make || "",
        model: driver.vehicle_info?.model || "",
        year: driver.vehicle_info?.year || "",
        plateNumber: driver.vehicle_info?.plateNumber || ""
      };
      
      // Prepare driver data with all required fields
      const driverData = {
        id: driver.id,
        status: status,
        rejection_reason: rejectionReason,
        national_id: driver.national_id || "",
        license_number: driver.license_number || "",
        vehicle_info: vehicleInfo
      };
      
      console.log("Updating driver status with data:", driverData);
      
      // Use service role (admin privileges) for this operation
      const { data, error } = await supabase
        .from("drivers")
        .upsert(driverData)
        .select();
        
      if (error) {
        console.error("Error saving driver status:", error);
        throw error;
      }
      
      console.log("Update response:", data);
      
      // Verify the update by fetching the latest data
      const { data: verifyData, error: verifyError } = await supabase
        .from("drivers")
        .select("status, rejection_reason")
        .eq("id", driver.id)
        .single();
        
      if (verifyError) {
        console.error("Error verifying update:", verifyError);
      } else {
        console.log("Verified status after update:", verifyData);
        if (verifyData.status !== status) {
          console.warn("Status mismatch after update! Expected:", status, "Got:", verifyData.status);
        }
      }
      
      return true;
    } catch (error) {
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
    } catch (error) {
      console.error("Error approving driver:", error);
      toast.error("فشل في تحديث حالة السائق. الرجاء التأكد من صلاحيات المسؤول الخاصة بك");
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
    } catch (error) {
      console.error("Error rejecting driver:", error);
      toast.error("فشل في تحديث حالة السائق. الرجاء التأكد من صلاحيات المسؤول الخاصة بك");
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
