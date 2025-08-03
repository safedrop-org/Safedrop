import { useLanguage } from "@/components/ui/language-context";

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'order' }) => {
  const { t } = useLanguage();

  const getOrderStatusConfig = (status: string) => {
    const configs = {
      available: { class: "bg-gray-100 text-gray-800", label: t("available") },
      pending: { class: "bg-yellow-100 text-yellow-800", label: t("pending") },
      assigned: { class: "bg-blue-100 text-blue-800", label: t("assigned") },
      picked_up: { class: "bg-blue-100 text-blue-800", label: t("pickedUp") },
      in_transit: { class: "bg-indigo-100 text-indigo-800", label: t("inTransit") },
      approaching: { class: "bg-yellow-100 text-yellow-800", label: t("approaching") },
      completed: { class: "bg-green-100 text-green-800", label: t("completed") },
      cancelled: { class: "bg-red-100 text-red-800", label: t("cancelled") },
    };
    return configs[status] || { class: "bg-gray-100 text-gray-800", label: status };
  };

  const getPaymentStatusConfig = (status: string) => {
    const configs = {
      paid: { class: "bg-green-100 text-green-800", label: t("paid") },
      pending: { class: "bg-yellow-100 text-yellow-800", label: t("pending") },
      failed: { class: "bg-red-100 text-red-800", label: t("failed") },
    };
    return configs[status] || { class: "bg-gray-100 text-gray-800", label: status };
  };

  const config = type === 'payment' ? getPaymentStatusConfig(status) : getOrderStatusConfig(status);

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.class}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
