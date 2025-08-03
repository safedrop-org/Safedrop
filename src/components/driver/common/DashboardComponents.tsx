import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import DriverSidebar from "@/components/driver/DriverSidebar";

// StatusBanner Component
interface StatusBannerProps {
  status: "approved" | "pending" | "rejected" | "frozen";
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  textColor: string;
  rejectionReason?: string;
  onReapply?: () => void;
  t: (key: string) => string;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  title,
  description,
  icon,
  bgColor,
  borderColor,
  textColor,
  rejectionReason,
  onReapply,
  t,
}) => (
  <div className={`${bgColor} ltr:border-l-4 rtl:border-r-4 ${borderColor} p-4 mb-6`}>
    <div className="flex items-start gap-3">
      {icon}
      <div>
        <p className={`font-medium ${textColor}`}>{title}</p>
        <p className={`${textColor.replace('800', '700')} text-sm`}>{description}</p>
        {rejectionReason && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800">{t("rejectionReason")}</h3>
            <p className="text-red-700 mt-2">{rejectionReason}</p>
          </div>
        )}
        {onReapply && (
          <>
            <p className="text-gray-600 mt-4">{t("reapplyNote")}</p>
            <Button variant="outline" className="mt-2" onClick={onReapply}>
              {t("reapply")}
            </Button>
          </>
        )}
      </div>
    </div>
  </div>
);

// StatCard Component
interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: React.ReactNode;
  bgColor: string;
  isLoading?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  bgColor, 
  isLoading = false, 
  onClick 
}) => (
  <Card className={onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold">
            {isLoading ? <span className="animate-pulse">...</span> : value}
          </h3>
        </div>
        <div 
          className={`${bgColor} p-3 rounded-full ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
          onClick={onClick}
        >
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Loading State Component
export const LoadingState: React.FC = () => (
  <div className="flex h-screen bg-gray-50">
    <DriverSidebar />
    <div className="flex-1 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
    </div>
  </div>
);

// Error State Component
interface ErrorStateProps {
  onRefresh: () => void;
  t: (key: string) => string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onRefresh, t }) => (
  <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
    <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
      <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
      <h2 className="text-2xl font-bold">{t("systemError")}</h2>
      <p className="text-gray-600">{t("errorLoadingAccount")}</p>
      <Button onClick={onRefresh}>
        {t("refreshPage")}
      </Button>
    </div>
  </div>
);
