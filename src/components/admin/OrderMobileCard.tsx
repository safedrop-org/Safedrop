import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Hash,
  Package,
  User,
  Truck,
  Calendar,
  DollarSign,
  CreditCard,
  Eye,
} from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderBadge";

interface OrderMobileCardProps {
  order: {
    id: string;
    order_id?: string;
    order_number?: string;
    status: string;
    payment_status: string;
    price?: number;
    created_at: string;
    customer?: {
      first_name?: string;
      last_name?: string;
    };
    driver?: {
      first_name?: string;
      last_name?: string;
    };
  };
  onViewOrder: (order: OrderMobileCardProps['order']) => void;
}

export const OrderMobileCard: React.FC<OrderMobileCardProps> = ({ 
  order, 
  onViewOrder 
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

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-500" />
              <span className="font-bold text-lg">{order.order_id}</span>
            </div>
            <OrderStatusBadge status={order.status} size="sm" />
          </div>

          {/* Order Code */}
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{t("orderCode")}</span>
            <span className="font-medium">
              {order.order_number
                ? order.order_number.substring(0, 8)
                : t("notSpecified")}
            </span>
          </div>

          {/* Customer & Driver Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("customer")}</span>
              <span className="font-medium">
                {order.customer
                  ? `${order.customer.first_name} ${order.customer.last_name}`
                  : t("unknown")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("driver")}</span>
              <span className="font-medium">
                {order.driver
                  ? `${order.driver.first_name} ${order.driver.last_name}`
                  : t("notAssigned")}
              </span>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("date")}</span>
              <span className="font-medium">
                {formatDate(order.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("priceLabel")}</span>
              <span className="font-medium">
                {order.price
                  ? `${order.price} ${t("currency")}`
                  : t("notSpecified")}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 text-sm">
                {t("paymentStatus")}
              </span>
            </div>
            <PaymentStatusBadge paymentStatus={order.payment_status} size="sm" />
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewOrder(order)}
              className="w-full gap-2"
            >
              <Eye className="h-4 w-4" />
              {t("viewFullOrderDetails")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
