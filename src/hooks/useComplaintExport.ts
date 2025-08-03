import { useLanguage } from '@/components/ui/language-context';
import { toast } from 'sonner';

export interface ComplaintForExport {
  complaint_number?: number;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    user_type?: string;
  };
  issue_type?: string;
  description?: string;
  order_number?: string;
  created_at: string;
  status: "pending" | "resolved";
}

export const useComplaintExport = () => {
  const { t, language } = useLanguage();

  const exportComplaints = (complaintsData: ComplaintForExport[]) => {
    const headers = [
      t("complaintNumber"),
      t("userName"),
      t("userType"),
      t("email"),
      t("issueType"),
      t("problemDescription"),
      t("orderNumber"),
      t("date"),
      t("status"),
    ];

    const csvData = complaintsData.map((complaint) => [
      complaint.complaint_number?.toString() || "",
      complaint.profiles
        ? `${complaint.profiles.first_name || ""} ${
            complaint.profiles.last_name || ""
          }`.trim()
        : t("notAvailable"),
      complaint.profiles?.user_type || t("notSpecified"),
      complaint.profiles?.email || t("notAvailable"),
      complaint.issue_type || "",
      complaint.description || "",
      complaint.order_number || t("notSpecified"),
      new Date(complaint.created_at).toLocaleDateString(
        language === "ar" ? "ar-SA" : "en-US"
      ),
      complaint.status === "resolved"
        ? t("statusResolved")
        : t("statusPending"),
    ]);

    let csvContent = headers.join(",") + "\n";
    csvData.forEach((row) => {
      csvContent += row.map((field) => `"${field}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `complaints-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t("exportSuccess"));
  };

  return { exportComplaints };
};
