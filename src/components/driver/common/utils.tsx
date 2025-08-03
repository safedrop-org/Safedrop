import {
  Bell,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  DollarSign,
  Package,
} from "lucide-react";

// Constants
export const NOTIFICATIONS_REFETCH_INTERVAL = 30000; // 30 seconds
export const MAX_NOTIFICATION_DISPLAY = 3;
export const NOTIFICATIONS_LIMIT = 99;

// Helper functions
export const handleSupabaseError = (error: unknown, context: string) => {
  console.error(`Error ${context}:`, error);
  throw error;
};

export const formatCurrency = (amount: number, language: string) => {
  const formattedAmount = amount.toFixed(2);
  return language === "ar" ? `${formattedAmount} ر.س` : `SAR ${formattedAmount}`;
};

export const getNotificationIcon = (type: string) => {
  const iconMap = {
    order: <Package className="h-5 w-5 text-blue-600" />,
    rating: <Star className="h-5 w-5 text-yellow-600" />,
    earning: <DollarSign className="h-5 w-5 text-green-600" />,
    complaint: <MessageSquare className="h-5 w-5 text-orange-600" />,
    complaint_confirmation: <MessageSquare className="h-5 w-5 text-orange-600" />,
    complaint_resolved: <CheckCircle className="h-5 w-5 text-green-600" />,
    system: <Bell className="h-5 w-5 text-purple-600" />,
  };
  return iconMap[type as keyof typeof iconMap] || <Bell className="h-5 w-5 text-gray-600" />;
};

// Status Banner Configuration
export const getStatusBannerConfig = (status: string, t: (key: string) => string, navigate: (path: string) => void) => {
  const baseConfig = {
    title: "",
    description: "",
    icon: null as React.ReactNode,
    bgColor: "",
    borderColor: "",
    textColor: "",
  };

  const statusConfig = {
    approved: {
      ...baseConfig,
      title: t("accountApproved"),
      description: t("accountApprovedDesc"),
      icon: <CheckCircle className="h-6 w-6 text-green-500 mr-3" />,
      bgColor: "bg-green-50",
      borderColor: "border-green-500",
      textColor: "text-green-800",
    },
    pending: {
      ...baseConfig,
      title: t("accountPending"),
      description: t("accountPendingDesc"),
      icon: <Clock className="h-6 w-6 text-yellow-500 mr-3" />,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-500",
      textColor: "text-yellow-800",
    },
    rejected: {
      ...baseConfig,
      title: t("accountRejected"),
      description: t("accountRejectedDesc"),
      icon: <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />,
      bgColor: "bg-red-50",
      borderColor: "border-red-500",
      textColor: "text-red-800",
      onReapply: () => navigate("/driver/profile"),
    },
    frozen: {
      ...baseConfig,
      title: t("accountFrozen"),
      description: t("accountFrozenDesc"),
      icon: <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />,
      bgColor: "bg-red-100",
      borderColor: "border-red-600",
      textColor: "text-red-700",
    },
  };

  return statusConfig[status as keyof typeof statusConfig];
};
