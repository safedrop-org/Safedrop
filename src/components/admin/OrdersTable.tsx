import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Package } from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderBadge";
import { OrderMobileCard } from "./OrderMobileCard";

type Order = {
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

interface OrdersTableProps {
  orders: Order[];
  status?: "all" | "available" | "picked_up" | "approaching" | "completed";
  onViewOrder: (order: Order) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  status = "all",
  onViewOrder,
}) => {
  const { t, language } = useLanguage();

  const filteredOrders =
    status === "all"
      ? orders
      : orders.filter((order) => order.status === status);

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

  if (filteredOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <Package className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-500 text-lg">{t("noOrdersInCategory")}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table - Large screens */}
      <div className="hidden xl:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                  {t("Order ID")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[120px] font-bold">
                  {t("Order Code")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[140px] font-bold">
                  {t("customer")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[140px] font-bold">
                  {t("driver")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                  {t("orderDate")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                  {t("price")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[120px] font-bold">
                  {t("Status")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[120px] font-bold">
                  {t("paymentStatus")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                  {t("Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="font-semibold text-center">
                    {order.order_id}
                  </TableCell>
                  <TableCell className="font-medium text-center">
                    <div
                      className="max-w-[120px] truncate"
                      title={order.order_number || t("notSpecified")}
                    >
                      #
                      {order.order_number
                        ? order.order_number
                        : t("notSpecified")}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="max-w-[140px] truncate"
                      title={
                        order.customer
                          ? `${order.customer.first_name} ${order.customer.last_name}`
                          : t("unknown")
                      }
                    >
                      {order.customer
                        ? `${order.customer.first_name} ${order.customer.last_name}`
                        : t("unknown")}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="max-w-[140px] truncate"
                      title={
                        order.driver
                          ? `${order.driver.first_name} ${order.driver.last_name}`
                          : t("notAssigned")
                      }
                    >
                      {order.driver
                        ? `${order.driver.first_name} ${order.driver.last_name}`
                        : t("notAssigned")}
                    </div>
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap text-sm">
                    {formatDate(order.created_at)}
                  </TableCell>
                  <TableCell className="text-center">
                    {order.price
                      ? `${order.price} ${t("currency")}`
                      : t("notSpecified")}
                  </TableCell>
                  <TableCell className="text-center">
                    <OrderStatusBadge status={order.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-center">
                    <PaymentStatusBadge paymentStatus={order.payment_status} size="sm" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewOrder(order)}
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

      {/* Tablet Table - Medium to Large screens */}
      <div className="hidden lg:block xl:hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("Order ID")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("customer")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("driver")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("price")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("Status")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="font-semibold text-center">
                    {order.order_id}
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="max-w-[120px] truncate"
                      title={
                        order.customer
                          ? `${order.customer.first_name} ${order.customer.last_name}`
                          : t("unknown")
                      }
                    >
                      {order.customer
                        ? `${order.customer.first_name} ${order.customer.last_name}`
                        : t("unknown")}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="max-w-[120px] truncate"
                      title={
                        order.driver
                          ? `${order.driver.first_name} ${order.driver.last_name}`
                          : t("notAssigned")
                      }
                    >
                      {order.driver
                        ? `${order.driver.first_name} ${order.driver.last_name}`
                        : t("notAssigned")}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {order.price
                      ? `${order.price} ${t("currency")}`
                      : t("notSpecified")}
                  </TableCell>
                  <TableCell className="text-center">
                    <OrderStatusBadge status={order.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewOrder(order)}
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

      {/* Compact Table - Small to Medium screens */}
      <div className="hidden md:block lg:hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("order")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("customer")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("Status")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("price")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="font-semibold text-center">
                    {order.order_id}
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="max-w-[100px] truncate text-xs"
                      title={
                        order.customer
                          ? `${order.customer.first_name} ${order.customer.last_name}`
                          : t("unknown")
                      }
                    >
                      {order.customer
                        ? `${order.customer.first_name} ${order.customer.last_name}`
                        : t("unknown")}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <OrderStatusBadge status={order.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    {order.price
                      ? `${order.price} ${t("currency")}`
                      : t("notSpecified")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewOrder(order)}
                      className="text-blue-600 hover:text-blue-800 p-1"
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

      {/* Mobile Cards - Small screens */}
      <div className="block md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <OrderMobileCard
            key={order.id}
            order={order}
            onViewOrder={onViewOrder}
          />
        ))}
      </div>
    </>
  );
};
