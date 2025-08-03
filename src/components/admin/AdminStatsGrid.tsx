import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/components/ui/language-context';

interface AdminStatsGridProps {
  totalCount: number;
  pendingCount: number;
  resolvedCount: number;
  completionRate: number;
  totalLabel?: string;
  pendingLabel?: string;
  resolvedLabel?: string;
  rateLabel?: string;
}

export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({
  totalCount,
  pendingCount,
  resolvedCount,
  completionRate,
  totalLabel,
  pendingLabel,
  resolvedLabel,
  rateLabel,
}) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-gray-900">
              {totalCount}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              {totalLabel || t("totalComplaints")}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">
              {pendingCount}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              {pendingLabel || t("pendingReview")}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {resolvedCount}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              {resolvedLabel || t("resolved")}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {completionRate}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              {rateLabel || t("resolutionRate")}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
