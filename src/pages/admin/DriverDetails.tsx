
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
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      
      if (profileError) throw profileError;
      
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
      // First check if driver record exists
      const { data: existingDriver, error: checkError } = await supabase
        .from("drivers")
        .select("id, status")
        .eq("id", driver.id)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking driver existence:", checkError);
        throw new Error("فشل في التحقق من وجود السائق في قاعدة البيانات");
      }
      
      // Prepare driver data
      const driverData = {
        status: "approved",
        rejection_reason: null,
        national_id: driver.national_id || "",
        license_number: driver.license_number || "",
        vehicle_info: driver.vehicle_info || { 
          make: "", 
          model: "", 
          year: "", 
          plateNumber: "" 
        }
      };
      
      let result;
      
      // Create or update the driver record
      if (!existingDriver) {
        console.log("Creating new driver record:", { id: driver.id, ...driverData });
        result = await supabase
          .from("drivers")
          .insert({ id: driver.id, ...driverData });
      } else {
        console.log("Updating existing driver:", { id: driver.id, ...driverData });
        result = await supabase
          .from("drivers")
          .update(driverData)
          .eq("id", driver.id);
      }

      if (result.error) {
        console.error("Error saving driver data:", result.error);
        throw new Error("حدث خطأ أثناء حفظ بيانات السائق");
      }
      
      toast.success("تم قبول السائق بنجاح");
      
      // Update local state
      setDriver(prev => prev ? { ...prev, status: "approved", rejection_reason: null } : null);
      
      // Navigate back after a short delay
      setTimeout(() => navigate("/admin/driver-verification"), 1500);
    } catch (error) {
      console.error("Error approving driver:", error);
      toast.error(error.message || "حدث خطأ أثناء قبول السائق");
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
      // First check if driver record exists
      const { data: existingDriver, error: checkError } = await supabase
        .from("drivers")
        .select("id, status")
        .eq("id", driver.id)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking driver existence:", checkError);
        throw new Error("فشل في التحقق من وجود السائق في قاعدة البيانات");
      }

      // Prepare driver data
      const driverData = {
        status: "rejected",
        rejection_reason: rejectionReason,
        national_id: driver.national_id || "",
        license_number: driver.license_number || "",
        vehicle_info: driver.vehicle_info || { 
          make: "", 
          model: "", 
          year: "", 
          plateNumber: "" 
        }
      };
      
      let result;
      
      // Create or update the driver record
      if (!existingDriver) {
        console.log("Creating new driver record with rejected status:", { id: driver.id, ...driverData });
        result = await supabase
          .from("drivers")
          .insert({ id: driver.id, ...driverData });
      } else {
        console.log("Updating existing driver with rejected status:", { id: driver.id, ...driverData });
        result = await supabase
          .from("drivers")
          .update(driverData)
          .eq("id", driver.id);
      }

      if (result.error) {
        console.error("Error rejecting driver:", result.error);
        throw new Error("حدث خطأ أثناء رفض السائق");
      }
      
      setShowRejectDialog(false);
      
      toast.success("تم رفض السائق بنجاح");
      
      // Update local state
      setDriver(prev => prev ? { ...prev, status: "rejected", rejection_reason: rejectionReason } : null);
      
      // Navigate back after a short delay
      setTimeout(() => navigate("/admin/driver-verification"), 1500);
    } catch (error) {
      console.error("Error rejecting driver:", error);
      toast.error(error.message || "حدث خطأ أثناء رفض السائق");
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
