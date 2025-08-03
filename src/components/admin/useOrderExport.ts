import React from "react";
import { useLanguage } from "@/components/ui/language-context";
import { toast } from "sonner";

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

export const useOrderExport = () => {
  const { t } = useLanguage();

  const exportOrders = (orders: Order[]) => {
    const headers = [
      t("Order ID"),
      t("Order Code"),
      t("customer"),
      t("driver"),
      t("orderDate"),
      t("price"),
      t("Status"),
      t("paymentStatus"),
    ];

    const csvData = orders.map((order) => [
      order.order_id || order.id,
      order.order_number || t("notSpecified"),
      order.customer
        ? `${order.customer.first_name} ${order.customer.last_name}`
        : t("unknown"),
      order.driver
        ? `${order.driver.first_name} ${order.driver.last_name}`
        : t("notAssigned"),
      new Date(order.created_at).toLocaleDateString("ar-SA"),
      order.price ? `${order.price} ${t("currency")}` : t("notSpecified"),
      order.status,
      order.payment_status,
    ]);

    let csvContent = headers.join(",") + "\n";
    csvData.forEach((row) => {
      csvContent += row.map((field) => `"${field}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t("ordersExportedSuccessfully"));
  };

  return { exportOrders };
};
