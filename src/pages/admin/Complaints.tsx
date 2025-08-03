// Enhanced Admin Complaints Component with Driver/Customer Notification Handling

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/components/ui/language-context";
import {
  AdminPageHeader,
  AdminSearchAndFilters,
  AdminStatsGrid,
  AdminTabs,
  AdminTabsList,
  AdminTabsTrigger,
  AdminTabsContent,
  ComplaintsTable,
  AdminLoadingState,
  AdminErrorState,
  IssueTypeBadge,
  StatusBadge,
  UserTypeBadge,
} from "@/components/admin";
import { ComplaintType } from "@/components/admin/ComplaintMobileCard";
import { useComplaintExport } from "@/hooks/useComplaintExport";

interface ComplaintDetailsModalProps {
  complaint: ComplaintType | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: () => void;
}

const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onStatusUpdate,
}) => {
  const { t, language } = useLanguage();
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const getIssueTypeLabel = (type: string) => {
    const types = {
      login: t("issueTypeLogin"),
      order: t("issueTypeOrder"),
      payment: t("issueTypePayment"),
      driver: t("issueTypeDriver"),
      customer: t("issueTypeCustomer"),
      other: t("issueTypeOther"),
    };
    return types[type as keyof typeof types] || type;
  };

  const getUserTypeBadge = (userType: string) => {
    return <UserTypeBadge userType={userType} />;
  };

  const sendNotificationBasedOnUserType = async (
    userId: string,
    userType: string,
    title: string,
    message: string,
    notificationType: string
  ) => {
    try {
      const notificationData = {
        title,
        message,
        notification_type: notificationType,
        read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (userType === "driver") {
        // Send to driver_notifications table
        await supabase.from("driver_notifications").insert({
          ...notificationData,
          driver_id: userId,
        });
      } else if (userType === "customer") {
        // Send to customer_notifications table
        await supabase.from("customer_notifications").insert({
          ...notificationData,
          customer_id: userId,
        });
      } else {
        // Fallback: try both tables
        console.warn(
          `Unknown user type: ${userType}, trying both notification tables`
        );

        // Try driver table first
        try {
          await supabase.from("driver_notifications").insert({
            ...notificationData,
            driver_id: userId,
          });
        } catch (driverError) {
          console.log(
            "Failed to insert into driver_notifications, trying customer_notifications"
          );

          // If driver fails, try customer
          await supabase.from("customer_notifications").insert({
            ...notificationData,
            customer_id: userId,
          });
        }
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  };

  const sendAdminEmailNotification = async (
    complaintData,
    adminResponse,
    userId
  ) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, first_name, last_name, user_type")
        .eq("id", userId)
        .single();

      if (!profile) {
        console.log("No profile found for user");
        return;
      }

      if (!profile.email) {
        console.log("No email found for user profile");
        return;
      }

      console.log("Attempting to send admin response email to:", profile.email);

      const currentLanguage = language;
      const userType = profile.user_type || "customer";

      const { data: emailResult, error: emailError } =
        await supabase.functions.invoke("send-admin-response", {
          body: {
            to: profile.email,
            language: currentLanguage,
            userType: userType,
            complaintData: {
              ...complaintData,
              userName: `${profile.first_name} ${profile.last_name}`.trim(),
              userEmail: profile.email,
            },
            adminResponse: adminResponse,
          },
        });

      if (emailError) {
        console.error("Error sending admin response email:", emailError);
      } else {
        console.log("Admin response email sent successfully:", emailResult);
      }
    } catch (error) {
      console.error("Error in sendAdminEmailNotification:", error);
    }
  };

  const markAsResolved = async () => {
    if (!complaint) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          status: "resolved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", complaint.id);

      if (error) throw error;

      if (response.trim()) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        await supabase.from("complaint_responses").insert({
          complaint_id: complaint.id,
          admin_id: user?.id,
          response: response.trim(),
          created_at: new Date().toISOString(),
        });
      }

      await sendAdminEmailNotification(
        {
          id: complaint.id,
          complaint_number: complaint.complaint_number,
          issue_type: complaint.issue_type,
          description: complaint.description,
          order_number: complaint.order_number,
          created_at: complaint.created_at,
        },
        response.trim() || null,
        complaint.user_id
      );

      const notificationMessage = response.trim()
        ? t("complaintResolvedWithResponse")
            .replace("{complaintNumber}", complaint.complaint_number.toString())
            .replace("{issueType}", getIssueTypeLabel(complaint.issue_type))
            .replace("{response}", response.trim())
        : t("complaintResolvedWithoutResponse")
            .replace("{complaintNumber}", complaint.complaint_number.toString())
            .replace("{issueType}", getIssueTypeLabel(complaint.issue_type));

      const userType = complaint.profiles?.user_type || "customer";

      await sendNotificationBasedOnUserType(
        complaint.user_id,
        userType,
        t("complaintResolvedTitle"),
        notificationMessage,
        "complaint_resolved"
      );
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      onStatusUpdate?.();
      onClose();
    } catch (error) {
      console.error("Error updating complaint:", error);
      toast.error(t("errorUpdatingComplaint"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!complaint) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-left">
            {t("complaintDetails")} {complaint.complaint_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* User Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                {t("userName")}
              </p>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm sm:text-base">
                  {complaint.profiles
                    ? `${complaint.profiles.first_name || ""} ${
                        complaint.profiles.last_name || ""
                      }`.trim()
                    : t("notAvailable")}
                </p>
                {getUserTypeBadge(complaint.profiles?.user_type || "")}
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                {t("emailAddress")}
              </p>
              <p className="font-medium text-sm sm:text-base break-all">
                {complaint.profiles?.email || t("notAvailable")}
              </p>
            </div>
          </div>

          {/* Complaint Information */}
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  {t("issueType")}
                </p>
                <IssueTypeBadge type={complaint.issue_type} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  {t("orderNumber")}
                </p>
                <p className="font-medium text-sm sm:text-base">
                  {complaint.order_number || t("notSpecified")}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                {t("problemDescription")}
              </p>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs sm:text-sm leading-relaxed">
                  {complaint.description}
                </p>
              </div>
            </div>

            {complaint.attachment_url && (
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                  {t("attachment")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(complaint.attachment_url, "_blank")
                  }
                  className="gap-2 text-xs sm:text-sm"
                >
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                  {t("viewAttachment")}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  {t("submissionDate")}
                </p>
                <p className="font-medium text-xs sm:text-sm">
                  {new Date(complaint.created_at).toLocaleDateString(
                    language === "ar" ? "ar-SA" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  {t("status")}
                </p>
                <StatusBadge status={complaint.status} />
              </div>
            </div>
          </div>

          {/* Admin Response */}
          {complaint.status !== "resolved" && (
            <div className="space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                  {t("adminResponse")}
                </label>
                <Textarea
                  placeholder={t("writeResponsePlaceholder")}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="min-h-[80px] sm:min-h-[100px] text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("responseNotificationNote")}
                  {complaint.profiles?.user_type && (
                    <span className="font-medium">
                      {" "}
                      (
                      {complaint.profiles.user_type === "driver"
                        ? t("driverNotification")
                        : t("customerNotification")}
                      )
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={markAsResolved}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-sm"
                >
                  {isLoading ? t("updatingComplaint") : t("markAsResolved")}
                </Button>
                <Button variant="outline" onClick={onClose} className="text-sm">
                  {t("cancel")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Complaints Component - Enhanced with customer support
const Complaints: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIssueType, setFilterIssueType] = useState("all");
  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintType | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { exportComplaints } = useComplaintExport();

  const {
    data: complaintsData = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select(
          `
          *,
          profiles (
            first_name,
            last_name,
            email,
            user_type
          )
        `
        )
        .order("complaint_number", { ascending: false });

      if (error) {
        console.error("Error fetching complaints:", error);
        throw error;
      }

      return (data || []) as ComplaintType[];
    },
    staleTime: 0, // Always refetch when component mounts
    gcTime: 0, // Don't cache the data
  });

  // Add useEffect to refetch on mount
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  // Add error handling
  React.useEffect(() => {
    if (error) {
      console.error("Error fetching complaints:", error);
      toast.error(t("errorLoadingComplaints"));
    }
  }, [error, t]);

  const handleViewComplaint = (complaint: ComplaintType) => {
    setSelectedComplaint(complaint);
    setIsDetailsOpen(true);
  };

  const handleStatusUpdate = () => {
    refetch();
    toast.success(t("complaintStatusUpdated"));
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedComplaint(null);
  };

  const handleExportComplaints = () => {
    exportComplaints(complaintsData);
  };

  const filteredComplaints = complaintsData.filter((complaint) => {
    const userName = complaint.profiles
      ? `${complaint.profiles.first_name || ""} ${
          complaint.profiles.last_name || ""
        }`.trim()
      : "";

    const matchesSearch =
      complaint.complaint_number?.toString().includes(searchTerm) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.profiles?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.order_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIssueType =
      filterIssueType === "all" || complaint.issue_type === filterIssueType;

    return matchesSearch && matchesIssueType;
  });

  if (error) {
    return (
      <AdminErrorState
        title={t("errorLoadingData")}
        message={t("errorLoadingComplaints")}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header Section */}
        <AdminPageHeader
          title={t("complaintsManagementTitle")}
          description={t("complaintsManagementDescription")}
        >
          <AdminSearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterIssueType={filterIssueType}
            onFilterChange={setFilterIssueType}
            onExport={handleExportComplaints}
            disableExport={complaintsData.length === 0}
          />
        </AdminPageHeader>

        {/* Stats Cards */}
        <AdminStatsGrid
          totalCount={complaintsData.length}
          pendingCount={complaintsData.filter((c) => c.status === "pending").length}
          resolvedCount={complaintsData.filter((c) => c.status === "resolved").length}
          completionRate={
            complaintsData.length > 0
              ? Math.round(
                  (complaintsData.filter((c) => c.status === "resolved").length /
                    complaintsData.length) *
                    100
                )
              : 0
          }
        />

        {/* Loading State */}
        {isLoading ? (
          <AdminLoadingState message={t("loadingComplaints")} />
        ) : (
          /* Main Content */
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl">
                {t("searchResultsCount")
                  .replace("{count}", filteredComplaints.length.toString())
                  .replace("{total}", complaintsData.length.toString())}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 lg:p-6">
              <AdminTabs defaultValue="all">
                <AdminTabsList>
                  <AdminTabsTrigger value="all">
                    <span className="hidden sm:inline">
                      {t("allComplaints")}
                    </span>
                    <span className="sm:hidden">{t("all")}</span>
                    <span className="ml-1 rtl:mr-1">
                      ({filteredComplaints.length})
                    </span>
                  </AdminTabsTrigger>
                  <AdminTabsTrigger value="pending">
                    <span className="hidden sm:inline">
                      {t("pendingReview")}
                    </span>
                    <span className="sm:hidden">{t("pending")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredComplaints.filter((c) => c.status === "pending")
                          .length
                      }
                      )
                    </span>
                  </AdminTabsTrigger>
                  <AdminTabsTrigger value="resolved">
                    <span className="hidden sm:inline">{t("resolved")}</span>
                    <span className="sm:hidden">{t("resolvedTab")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredComplaints.filter(
                          (c) => c.status === "resolved"
                        ).length
                      }
                      )
                    </span>
                  </AdminTabsTrigger>
                </AdminTabsList>

                <AdminTabsContent value="all">
                  <ComplaintsTable
                    complaints={filteredComplaints}
                    onViewComplaint={handleViewComplaint}
                  />
                </AdminTabsContent>

                <AdminTabsContent value="pending">
                  <ComplaintsTable
                    complaints={filteredComplaints}
                    status="pending"
                    onViewComplaint={handleViewComplaint}
                  />
                </AdminTabsContent>

                <AdminTabsContent value="resolved">
                  <ComplaintsTable
                    complaints={filteredComplaints}
                    status="resolved"
                    onViewComplaint={handleViewComplaint}
                  />
                </AdminTabsContent>
              </AdminTabs>
            </CardContent>
          </Card>
        )}

        {/* Complaint Details Modal */}
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
};

export default Complaints;
