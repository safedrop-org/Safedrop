import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DriverInfoCard } from "@/components/admin/driver/DriverInfoCard";
import { DriverActions } from "@/components/admin/driver/DriverActions";
import { RejectionDialog } from "@/components/admin/driver/RejectionDialog";
import { Eye, Download, X } from "lucide-react";
import Cookies from "js-cookie";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";

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
  id_image?: string;
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

const ImageViewer = ({
  src,
  alt,
  title,
  onClose,
}: {
  src: string;
  alt: string;
  title: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="relative max-h-screen p-4 w-auto m-auto">
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-10 bg-safedrop-gold hover:bg-safedrop-gold/90 text-white"
        onClick={onClose}
      >
        <X size={16} />
      </Button>
      <div className=" rounded-lg p-6 max-h-full overflow-auto">
        <h3 className="text-lg font-bold mb-4 text-center">{title}</h3>
        <div className="flex justify-center">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  </div>
);

const ImageCard = ({
  src,
  alt,
  title,
  onView,
  onDownload,
  t,
}: {
  src: string;
  alt: string;
  title: string;
  onView: () => void;
  onDownload: () => void;
  t: any;
}) => (
  <div className="space-y-3">
    <h4 className="text-base font-medium text-center text-gray-700">{title}</h4>
    <div className="relative group">
      <div className="w-full h-48 rounded-lg border border-gray-200 overflow-hidden">
        <img src={src} alt={alt} className="w-full h-full object-contain" />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onView}
            className="bg-white bg-opacity-95 hover:bg-opacity-100 text-gray-700 shadow-md"
          >
            <Eye size={16} className="mr-1" />
            {t("view")}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onDownload}
            className="bg-white bg-opacity-95 hover:bg-opacity-100 text-gray-700 shadow-md"
          >
            <Download size={16} className="mr-1" />
            {t("download")}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const DriverDetailsContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [driver, setDriver] = useState<DriverDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [viewingImage, setViewingImage] = useState<{
    src: string;
    alt: string;
    title: string;
  } | null>(null);

  const checkAdminAccess = async () => {
    try {
      const adminAuthLS = localStorage.getItem("adminAuth") === "true";
      const adminAuthCookie = Cookies.get("adminAuth") === "true";



      if (!adminAuthLS && !adminAuthCookie) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();

          if (roleData) {
            localStorage.setItem("adminAuth", "true");
            Cookies.set("adminAuth", "true");
            return true;
          }
        }

        toast.error(t("noAdminPermission"));
        navigate("/admin/login");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast.error(t("adminAccessError"));
      navigate("/admin/login");
      return false;
    }
  };

  const fetchDriverDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const hasAccess = await checkAdminAccess();
      if (!hasAccess) return;


      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }


      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (driverError && driverError.code !== "PGRST116") {
        console.error("Driver error:", driverError);
        throw driverError;
      }


      let userEmail = profileData?.email || null;

      if (!userEmail) {
        try {
          const { data: userData } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", id)
            .single();
          userEmail = userData?.email;
        } catch (e) {
          console.error("Could not fetch user email:", e);
        }
      }

      const combinedData = {
        ...profileData,
        ...(driverData || {}),
        email: userEmail || profileData?.email,
      };

      setDriver(combinedData);
    } catch (error) {
      console.error("Error fetching driver details:", error);
      toast.error(t("dataFetchError"));
    } finally {
      setLoading(false);
    }
  };

  const saveDriverStatus = async (
    status: string,
    rejectionReason: string | null = null
  ) => {
    if (!driver?.id) {
      toast.error(t("invalidDriverId"));
      return null;
    }

    try {
      // Verify admin access before proceeding
      const hasAccess = await checkAdminAccess();
      if (!hasAccess) {
        throw new Error(t("noAdminPermission"));
      }


      const updateData = {
        status: status,
        rejection_reason: rejectionReason || null,
      };


      // Check if driver record exists first
      const { data: existingDriver, error: checkError } = await supabase
        .from("drivers")
        .select("id")
        .eq("id", driver.id)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking if driver exists:", checkError);
        throw checkError;
      }

      let result;

      // If driver record exists, update it, otherwise create it
      if (existingDriver) {
        const { data, error } = await supabase
          .from("drivers")
          .update(updateData)
          .eq("id", driver.id)
          .select();

        if (error) {
          console.error("Error updating driver status:", error);
          throw error;
        }
        result = data;
      } else {
        const fullData = {
          id: driver.id,
          status: status,
          rejection_reason: rejectionReason || null,
          national_id: driver.national_id || "",
          license_number: driver.license_number || "",
          vehicle_info: driver.vehicle_info || {},
        };

        const { data: upsertData, error: upsertError } = await supabase
          .from("drivers")
          .upsert(fullData)
          .select();

        if (upsertError) {
          console.error("Error creating driver record:", upsertError);
          throw upsertError;
        }
        result = upsertData;
      }
      return result;
    } catch (error: any) {
      console.error("Driver status update failed:", error);
      throw error;
    }
  };

  const approveDriver = async () => {
    if (!driver?.id) {
      toast.error(t("invalidDriverId"));
      return;
    }

    setProcessingAction(true);
    try {
      const result = await saveDriverStatus("approved");

      if (result) {
        toast.success(t("driverApprovedSuccess"));

        setDriver((prev) =>
          prev ? { ...prev, status: "approved", rejection_reason: null } : null
        );

        // Slight delay before navigating away
        setTimeout(() => navigate("/admin/driver-verification"), 1500);
      } else {
        throw new Error(t("statusUpdateError"));
      }
    } catch (error: any) {
      console.error("Error approving driver:", error);
      toast.error(error.message || t("statusUpdateError"));
    } finally {
      setProcessingAction(false);
    }
  };

  const rejectDriver = async () => {
    if (!driver?.id) {
      toast.error(t("invalidDriverId"));
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error(t("rejectionReasonRequired"));
      return;
    }

    setProcessingAction(true);
    try {
      const result = await saveDriverStatus("rejected", rejectionReason);

      if (result) {
        toast.success(t("driverRejectedSuccess"));

        setShowRejectDialog(false);
        setDriver((prev) =>
          prev
            ? { ...prev, status: "rejected", rejection_reason: rejectionReason }
            : null
        );

        // Slight delay before navigating away
        setTimeout(() => navigate("/admin/driver-verification"), 1500);
      } else {
        throw new Error(t("statusUpdateError"));
      }
    } catch (error: any) {
      console.error("Error rejecting driver:", error);
      toast.error(error.message || t("statusUpdateError"));
    } finally {
      setProcessingAction(false);
    }
  };

  const handleImageView = (src: string, alt: string, title: string) => {
    setViewingImage({ src, alt, title });
  };

  const handleImageDownload = async (src: string, filename: string) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t("imageDownloadSuccess"));
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error(t("imageDownloadError"));
    }
  };

  useEffect(() => {
    fetchDriverDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-xl">{t("loadingData")}</div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="p-6">
        <div className="text-xl text-red-600">{t("driverNotFound")}</div>
        <Button
          className="mt-4"
          onClick={() => navigate("/admin/driver-verification")}
        >
          {t("back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate("/admin/driver-verification")}
      >
        {t("back")}
      </Button>

      <div className="space-y-6">
        {/* Driver Info Card with Documents */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {t("driverDetails")}
            </CardTitle>
          </CardHeader>
          <DriverInfoCard {...driver} />

          {/* Driver Documents Section inside the same card */}
          {(driver.id_image || driver.license_image) && (
            <CardContent className="px-6 pb-6">
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-center mb-6">
                  {t("driverDocuments")}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {driver.id_image && (
                    <ImageCard
                      src={driver.id_image}
                      alt={t("idImage")}
                      title={t("idImage")}
                      onView={() =>
                        handleImageView(
                          driver.id_image!,
                          t("idImage"),
                          t("idImage")
                        )
                      }
                      onDownload={() =>
                        handleImageDownload(
                          driver.id_image!,
                          `${driver.first_name}_${driver.last_name}_ID.jpg`
                        )
                      }
                      t={t}
                    />
                  )}
                  {driver.license_image && (
                    <ImageCard
                      src={driver.license_image}
                      alt={t("licenseImage")}
                      title={t("licenseImage")}
                      onView={() =>
                        handleImageView(
                          driver.license_image!,
                          t("licenseImage"),
                          t("licenseImage")
                        )
                      }
                      onDownload={() =>
                        handleImageDownload(
                          driver.license_image!,
                          `${driver.first_name}_${driver.last_name}_License.jpg`
                        )
                      }
                      t={t}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          )}

          {/* No Documents Message inside the same card */}
          {!driver.id_image && !driver.license_image && (
            <CardContent className="px-6 pb-6">
              <div className="border-t pt-6 text-center text-gray-500">
                <p>{t("noDocuments")}</p>
              </div>
            </CardContent>
          )}

          <DriverActions
            status={driver.status}
            onApprove={approveDriver}
            onReject={() => setShowRejectDialog(true)}
            processingAction={processingAction}
          />
        </Card>
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <ImageViewer
          src={viewingImage.src}
          alt={viewingImage.alt}
          title={viewingImage.title}
          onClose={() => setViewingImage(null)}
        />
      )}

      {/* Rejection Dialog */}
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

const DriverDetails = () => {
  return (
    <LanguageProvider>
      <DriverDetailsContent />
    </LanguageProvider>
  );
};

export default DriverDetails;
