import React from "react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/ui/language-context";

// Order Status Badge Component
interface OrderStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ 
  status, 
  size = "md" 
}) => {
  const { t } = useLanguage();

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "available":
        return {
          text: t("available"),
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "completed":
        return {
          text: t("completed"),
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "picked_up":
        return {
          text: t("pickedUp"),
          className: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "approaching":
        return {
          text: t("approaching"),
          className: "bg-indigo-100 text-indigo-800 border-indigo-200",
        };
      case "in_transit":
        return {
          text: t("inTransit"),
          className: "bg-orange-100 text-orange-800 border-orange-200",
        };
      case "delivered":
        return {
          text: t("delivered"),
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "cancelled":
        return {
          text: t("cancelled"),
          className: "bg-red-100 text-red-800 border-red-200",
        };
      case "pending":
        return {
          text: t("pending"),
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      default:
        return {
          text: status || t("unknown"),
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const statusDisplay = getStatusDisplay(status);
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <Badge
      variant="outline"
      className={`${textSize} whitespace-nowrap ${statusDisplay.className}`}
    >
      {statusDisplay.text}
    </Badge>
  );
};

// Payment Status Badge Component
interface PaymentStatusBadgeProps {
  paymentStatus: string;
  size?: "sm" | "md";
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ 
  paymentStatus, 
  size = "md" 
}) => {
  const { t } = useLanguage();

  const getPaymentStatusDisplay = (status: string) => {
    switch (status) {
      case "paid":
        return {
          text: t("paid"),
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "pending":
        return {
          text: t("unpaid"),
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case "refunded":
        return {
          text: t("refunded"),
          className: "bg-purple-100 text-purple-800 border-purple-200",
        };
      default:
        return {
          text: status || t("unknown"),
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const statusDisplay = getPaymentStatusDisplay(paymentStatus);
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <Badge
      variant="outline"
      className={`${textSize} whitespace-nowrap ${statusDisplay.className}`}
    >
      {statusDisplay.text}
    </Badge>
  );
};
