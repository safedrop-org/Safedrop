import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Car, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/components/ui/language-context';

// Issue Type Badge Component
interface IssueTypeBadgeProps {
  type: string;
}

export const IssueTypeBadge: React.FC<IssueTypeBadgeProps> = ({ type }) => {
  const { t } = useLanguage();

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

  const getIssueTypeBadgeStyle = (type: string) => {
    const styles = {
      login: "bg-blue-100 text-blue-800 border-blue-200",
      order: "bg-purple-100 text-purple-800 border-purple-200",
      payment: "bg-green-100 text-green-800 border-green-200",
      driver: "bg-orange-100 text-orange-800 border-orange-200",
      customer: "bg-teal-100 text-teal-800 border-teal-200",
      other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return (
      styles[type as keyof typeof styles] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  return (
    <Badge
      variant="outline"
      className={`text-xs sm:text-sm whitespace-nowrap ${getIssueTypeBadgeStyle(type)}`}
    >
      {getIssueTypeLabel(type)}
    </Badge>
  );
};

// Status Badge Component
interface StatusBadgeProps {
  status: "pending" | "resolved";
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const { t } = useLanguage();

  const sizeClass = size === "sm" ? "text-xs" : "text-xs sm:text-sm";

  return (
    <Badge
      variant="outline"
      className={`${sizeClass} whitespace-nowrap ${
        status === "resolved"
          ? "bg-green-100 text-green-800 border-green-200"
          : "bg-yellow-100 text-yellow-800 border-yellow-200"
      }`}
    >
      {status === "resolved" ? t("statusResolved") : t("statusPending")}
    </Badge>
  );
};

// User Type Badge Component
interface UserTypeBadgeProps {
  userType: string;
  size?: "sm" | "md";
}

export const UserTypeBadge: React.FC<UserTypeBadgeProps> = ({ userType, size = "md" }) => {
  const { t } = useLanguage();

  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  if (userType === "driver") {
    return (
      <Badge className={`bg-blue-100 text-blue-800 border-blue-200 gap-1 ${textSize}`}>
        <Car className={iconSize} />
        {t("driver")}
      </Badge>
    );
  } else if (userType === "customer") {
    return (
      <Badge className={`bg-green-100 text-green-800 border-green-200 gap-1 ${textSize}`}>
        <ShoppingCart className={iconSize} />
        {t("customer")}
      </Badge>
    );
  }
  return (
    <Badge className={`bg-gray-100 text-gray-800 border-gray-200 ${textSize}`}>
      {userType || t("notSpecified")}
    </Badge>
  );
};
