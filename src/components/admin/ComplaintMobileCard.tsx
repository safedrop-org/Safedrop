import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Hash, 
  User, 
  Mail, 
  Calendar, 
  FileText, 
  Eye 
} from 'lucide-react';
import { useLanguage } from '@/components/ui/language-context';
import { IssueTypeBadge, StatusBadge, UserTypeBadge } from './ComplaintBadge';

export interface ComplaintType {
  id: string;
  complaint_number: number;
  user_id: string;
  issue_type: string;
  description: string;
  order_number?: string;
  status: "pending" | "resolved";
  created_at: string;
  attachment_url?: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email?: string;
    user_type?: string;
  };
}

interface ComplaintMobileCardProps {
  complaint: ComplaintType;
  onViewComplaint: (complaint: ComplaintType) => void;
}

export const ComplaintMobileCard: React.FC<ComplaintMobileCardProps> = ({ 
  complaint, 
  onViewComplaint 
}) => {
  const { t, language } = useLanguage();

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(
      language === "ar" ? "ar-SA" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getUserName = (profiles: ComplaintType['profiles']) => {
    if (!profiles) return t("notAvailable");
    const firstName = profiles.first_name || "";
    const lastName = profiles.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || t("notAvailable");
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-500" />
              <span className="font-bold text-lg">
                {complaint.complaint_number}
              </span>
            </div>
            <StatusBadge status={complaint.status} size="sm" />
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{t("user")}:</span>
                <span className="font-medium">
                  {getUserName(complaint.profiles)}
                </span>
              </div>
              <UserTypeBadge userType={complaint.profiles?.user_type || ""} size="sm" />
            </div>

            <div className="flex items-start gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
              <span className="text-gray-600">{t("email")}:</span>
              <span className="font-medium break-all text-left">
                {complaint.profiles?.email || t("notAvailable")}
              </span>
            </div>
          </div>

          {/* Complaint Details */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{t("issueType")}:</span>
              <IssueTypeBadge type={complaint.issue_type} />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t("orderNumber")}:</span>
              <span className="font-medium">
                {complaint.order_number || t("notSpecified")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("date")}:</span>
              <span className="font-medium">
                {formatDate(complaint.created_at)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="pt-2 border-t">
            <div className="flex items-start gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
              <span className="text-gray-600 text-sm">
                {t("problemDescription")}:
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-800 bg-gray-50 p-3 rounded-lg">
              {complaint.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewComplaint(complaint)}
              className="w-full gap-2"
            >
              <Eye className="h-4 w-4" />
              {t("viewFullDetails")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
