import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, Clock } from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";
import StaticMap from "./StaticMap";

interface Driver {
  first_name: string;
  last_name: string;
  phone: string;
}

interface Order {
  id: string;
  order_id: string;
  order_number?: string;
  created_at: string;
  pickup_location?: {
    address: string;
  };
  dropoff_location?: {
    address: string;
  };
  driver_id?: string;
  driver?: Driver;
  driver_location?: {
    lat: number;
    lng: number;
  };
  status: string;
}

interface OrderTableProps {
  orders: Order[];
  onCancelOrder?: (orderId: string) => void;
  onCompleteOrder?: (orderId: string) => void;
  showActions?: boolean;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onCancelOrder,
  onCompleteOrder,
  showActions = false,
}) => {
  const { t, language } = useLanguage();

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const badgeClasses = {
      base: "px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
      available: "bg-gray-100 text-gray-800",
      picked_up: "bg-blue-100 text-blue-800",
      in_transit: "bg-indigo-100 text-indigo-800",
      approaching: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const statusText = {
      available: t("available"),
      picked_up: t("pickedUp"),
      in_transit: t("inTransit"),
      approaching: t("approaching"),
      completed: t("completed"),
      cancelled: t("cancelled"),
    };

    return (
      <span
        className={`${badgeClasses.base} ${
          badgeClasses[status as keyof typeof badgeClasses] || badgeClasses.base
        }`}
      >
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <Clock className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <p>
          {showActions
            ? t("noCurrentOrders")
            : language === "ar"
            ? "لا يوجد سجل للطلبات السابقة"
            : "No order history available"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                {t("Order Code")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                {t("Order ID")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[140px]">
                {t("orderDate")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[150px]">
                {t("from")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[150px]">
                {t("to")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                {t("Driver")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                {t("Status")}
              </th>
              {showActions && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                  {t("Actions")}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => [
              <tr key={`${order.id}-main`} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.order_id}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.order_number || order.order_number?.slice(0, 8)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                  <div
                    className="truncate"
                    title={order.pickup_location?.address}
                  >
                    {order.pickup_location?.address ||
                      (language === "ar" ? "غير محدد" : "Not specified")}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                  <div
                    className="truncate"
                    title={order.dropoff_location?.address}
                  >
                    {order.dropoff_location?.address ||
                      (language === "ar" ? "غير محدد" : "Not specified")}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.driver
                    ? `${order.driver.first_name} ${order.driver.last_name}`
                    : language === "ar"
                    ? showActions
                      ? "لم يتم التعيين بعد"
                      : "غير متوفر"
                    : showActions
                    ? "Not assigned yet"
                    : "Not available"}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getStatusBadge(order.status)}
                </td>
                {showActions && (
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {/* Cancel button - only show for available and picked_up orders */}
                      {(order.status === "available" ||
                        order.status === "picked_up") &&
                        onCancelOrder && (
                          <Button
                            onClick={() => onCancelOrder(order.id)}
                            variant="destructive"
                            size="sm"
                            className="gap-1 whitespace-nowrap"
                          >
                            <X className="h-4 w-4" />
                            {t("Cancel Order")}
                          </Button>
                        )}

                      {/* Complete order button - only show for approaching orders */}
                      {order.status === "approaching" && onCompleteOrder && (
                        <Button
                          onClick={() => onCompleteOrder(order.id)}
                          variant="default"
                          size="sm"
                          className="gap-1 whitespace-nowrap"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {t("Order Received")}
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>,
              showActions && (
                <tr key={`${order.id}-map`}>
                  <td colSpan={8} className="px-4 py-4">
                    <StaticMap
                      pickup_location={order.pickup_location?.address || ""}
                      dropoff_location={order.dropoff_location?.address || ""}
                      driver_location={order.driver_location}
                    />
                  </td>
                </tr>
              ),
            ])}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
