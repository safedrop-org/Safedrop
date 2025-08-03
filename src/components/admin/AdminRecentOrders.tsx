import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PackageIcon, TruckIcon, Hash, Calendar, DollarSign } from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";

interface LocationObject {
  address: string;
  details?: string;
}

interface Order {
  id: string;
  customer_id: string;
  driver_id: string | null;
  pickup_location: LocationObject;
  dropoff_location: LocationObject;
  status: string;
  price: number;
  commission_rate: number;
  driver_payout: number | null;
  created_at: string;
  updated_at: string;
  estimated_distance: number | null;
  estimated_duration: number | null;
  actual_pickup_time: string | null;
  actual_delivery_time: string | null;
  payment_method: string | null;
  payment_status: string;
  notes: string;
  driver_location: { lat: number; lng: number } | null;
  package_details: string;
  order_id: number;
  order_number: string;
}

interface AdminRecentOrdersProps {
  orders: Order[];
  isLoading: boolean;
}

/**
 * AdminRecentOrders - مكون عرض الطلبات الحديثة في لوحة الإدارة
 * يعرض آخر 5 طلبات مع جداول responsive للشاشات المختلفة
 */
const AdminRecentOrders: React.FC<AdminRecentOrdersProps> = ({ orders, isLoading }) => {
  const { t, language } = useLanguage();

  const formatCurrency = (value: number) => {
    if (value === undefined || value === null) return `0 ${t("currency")}`;
    return `${value.toLocaleString()} ${t("currency")}`;
  };

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

  const getStatusBadge = (status: string) => {
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

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${statusDisplay.className}`}
      >
        {statusDisplay.text}
      </span>
    );
  };

  // Helper function to safely extract location address
  const getLocationAddress = (location: LocationObject | string | null | undefined) => {
    if (!location) return t("notSpecified");
    if (typeof location === "string") return location;
    if (typeof location === "object" && location.address) return location.address;
    return t("notSpecified");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {t("orders")} - {t("latest5Orders")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-gray-500">{t("loadingData")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {t("orders")} - {t("latest5Orders")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <PackageIcon className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg">{t("noOrders")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {t("orders")} - {t("latest5Orders")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table - Large screens */}
        <div className="hidden xl:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                    {t("orderNumber")}
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                    {t("orderId")}
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap min-w-[120px] font-bold">
                    {t("status")}
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap min-w-[140px] font-bold">
                    {t("pickupLocation")}
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap min-w-[140px] font-bold">
                    {t("deliveryLocation")}
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                    {t("amount")}
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap min-w-[120px] font-bold">
                    {t("dateCreated")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: Order) => (
                  <TableRow key={order.order_id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold text-center">
                      {order.order_id}
                    </TableCell>
                    <TableCell className="font-semibold text-center">
                      {order.order_number}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className="max-w-[140px] truncate"
                        title={getLocationAddress(order.pickup_location)}
                      >
                        {getLocationAddress(order.pickup_location)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className="max-w-[140px] truncate"
                        title={getLocationAddress(order.dropoff_location)}
                      >
                        {getLocationAddress(order.dropoff_location)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {order.price ? formatCurrency(order.price) : t("notSpecified")}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap text-sm">
                      {formatDate(order.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Tablet Table - Medium to Large screens */}
        <div className="hidden lg:block xl:hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center whitespace-nowrap font-bold">
                    {t("orderId")}
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap font-bold">
                    {t("orderNumber")}
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap font-bold">
                    {t("status")}
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap font-bold">
                    {t("amount")}
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap font-bold">
                    {t("dateCreated")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: Order) => (
                  <TableRow key={order.order_id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold text-center">
                      {order.order_id}
                    </TableCell>
                    <TableCell className="font-semibold text-center">
                      {order.order_number}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      {order.price ? formatCurrency(order.price) : t("notSpecified")}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap text-sm">
                      {formatDate(order.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Compact Table - Small to Medium screens */}
        <div className="hidden md:block lg:hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center whitespace-nowrap font-bold">
                    {t("orderId")}
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap font-bold">
                    {t("orderNumber")}
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap font-bold">
                    {t("status")}
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap font-bold">
                    {t("amount")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: Order) => (
                  <TableRow key={order.order_id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold text-center">
                      {order.order_id}
                    </TableCell>
                    <TableCell className="text-center">
                      {order.order_number}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {order.price ? formatCurrency(order.price) : t("notSpecified")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Cards - Small screens */}
        <div className="block md:hidden space-y-4">
          {orders.map((order: Order) => (
            <Card key={order.order_id} className="w-full">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <span className="font-bold text-lg">
                        {order.order_number}
                      </span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Location Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <PackageIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {t("pickupLocation")}:
                      </span>
                      <span className="font-medium">
                        {getLocationAddress(order.pickup_location)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <TruckIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {t("deliveryLocation")}:
                      </span>
                      <span className="font-medium">
                        {getLocationAddress(order.dropoff_location)}
                      </span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {t("dateCreated")}:
                      </span>
                      <span className="font-medium">
                        {formatDate(order.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {t("amount")}:
                      </span>
                      <span className="font-medium">
                        {order.price ? formatCurrency(order.price) : t("notSpecified")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRecentOrders;
