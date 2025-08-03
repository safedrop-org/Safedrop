import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, FileText } from 'lucide-react';
import { useLanguage } from '@/components/ui/language-context';
import { ComplaintType, ComplaintMobileCard } from './ComplaintMobileCard';
import { IssueTypeBadge, StatusBadge, UserTypeBadge } from './ComplaintBadge';

interface ComplaintsTableProps {
  complaints: ComplaintType[];
  status?: "all" | "pending" | "resolved";
  onViewComplaint: (complaint: ComplaintType) => void;
}

export const ComplaintsTable: React.FC<ComplaintsTableProps> = ({
  complaints,
  status = "all",
  onViewComplaint,
}) => {
  const { t, language } = useLanguage();

  const filteredComplaints =
    status === "all"
      ? complaints
      : complaints.filter((complaint) => complaint.status === status);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return t("invalidDate");
      return date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return t("invalidDate");
    }
  };

  const getUserName = (profiles: ComplaintType['profiles']) => {
    if (!profiles) return t("notAvailable");
    const firstName = profiles.first_name || "";
    const lastName = profiles.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || t("notAvailable");
  };

  if (filteredComplaints.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <FileText className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-500 text-lg">{t("noComplaintsInCategory")}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("complaintNumber")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("user")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("userType")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("email")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("issueTypeHeader")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("date")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("status")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id} className="hover:bg-gray-50">
                  <TableCell className="font-semibold text-center">
                    {complaint.complaint_number}
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="max-w-[140px] truncate"
                      title={getUserName(complaint.profiles)}
                    >
                      {getUserName(complaint.profiles)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <UserTypeBadge userType={complaint.profiles?.user_type || ""} />
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="max-w-[180px] truncate"
                      title={complaint.profiles?.email || t("notAvailable")}
                    >
                      {complaint.profiles?.email || t("notAvailable")}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <IssueTypeBadge type={complaint.issue_type} />
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap text-sm">
                    {formatDate(complaint.created_at)}
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={complaint.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewComplaint(complaint)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-4">
        {filteredComplaints.map((complaint) => (
          <ComplaintMobileCard
            key={complaint.id}
            complaint={complaint}
            onViewComplaint={onViewComplaint}
          />
        ))}
      </div>
    </>
  );
};
