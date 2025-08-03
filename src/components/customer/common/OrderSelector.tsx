import React from "react";
import { useLanguage } from "@/components/ui/language-context";

interface Order {
  id: string;
  created_at: string;
  driver?: {
    first_name?: string;
    last_name?: string;
  };
}

interface OrderSelectorProps {
  orders: Order[];
  selectedOrder: string | null;
  onOrderSelect: (orderId: string) => void;
}

const OrderSelector: React.FC<OrderSelectorProps> = ({
  orders,
  selectedOrder,
  onOrderSelect,
}) => {
  const { t } = useLanguage();

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatOrderLabel = (order: Order) => {
    const date = formatDate(order.created_at);
    const driverName = order.driver
      ? `${order.driver.first_name || ""} ${
          order.driver.last_name || ""
        }`.trim()
      : "Unknown Driver";

    return `${date} - ${driverName}`;
  };

  return (
    <div>
      <label
        htmlFor="order"
        className="block mb-1 font-semibold text-gray-700"
      >
        {t("Select order to rate") || "اختر طلب للتقييم"}
      </label>
      <select
        id="order"
        className="w-full rounded border border-gray-300 px-3 py-2"
        value={selectedOrder || ""}
        onChange={(e) => onOrderSelect(e.target.value)}
        required
      >
        <option value="">{t("Select an order") || "اختر طلب"}</option>
        {orders.map((order) => (
          <option key={order.id} value={order.id}>
            {formatOrderLabel(order)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OrderSelector;
