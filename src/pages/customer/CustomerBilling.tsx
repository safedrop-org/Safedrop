import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import CustomerPageLayout from "@/components/customer/CustomerPageLayout";
import StatusBadge from "@/components/customer/common/StatusBadge";
import DataTable from "@/components/customer/common/DataTable";
import { StatsGrid } from "@/components/customer/common/StatsGrid";
import { useFormatDate, useFormatCurrency } from "@/hooks/useFormatters";
import { toast } from "sonner";
import { CreditCard, DollarSign, Receipt, AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";

interface Transaction {
  id: string;
  order_id: string;
  order_number: string;
  price: number;
  payment_status: string;
  created_at: string;
  status: string;
}

const CustomerBillingContent = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { formatDate } = useFormatDate();
  const { formatCurrency } = useFormatCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select(
            "id, order_id, order_number, price, payment_status, created_at, status"
          )
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        // Calculate total spent on completed orders
        const total = orders
          .filter(
            (order) =>
              order.status === "completed" && order.payment_status === "paid"
          )
          .reduce((sum, order) => sum + (order.price || 0), 0);

        setTotalSpent(total);
        setTransactions(orders || []);
      } catch (error) {
        console.error("Error fetching billing data:", error);
        toast.error(t("errorLoadingBillingData"));
      } finally {
        setLoading(false);
      }
    };

  }, [user, t]);

  const statsData = [
    {
      title: t("Total Payments"),
      value: formatCurrency(totalSpent),
      icon: <DollarSign className="h-5 w-5 text-safedrop-gold" />,
    },
    {
      title: t("Payment Method"),
      value: t("You need to add a payment method"),
      icon: <CreditCard className="h-5 w-5 text-safedrop-gold" />,
      description: t("No payment methods registered"),
    },
    {
      title: t("Number of Invoices"),
      value: transactions.length.toString(),
      icon: <Receipt className="h-5 w-5 text-safedrop-gold" />,
    },
  ];

  const tableColumns = [
    {
      key: "order_id",
      header: t("Invoice ID"),
      className: "text-gray-900",
    },
    {
      key: "order_number",
      header: t("Order ID"),
    },
    {
      key: "created_at",
      header: t("Date"),
      render: (value: string) => formatDate(value),
    },
    {
      key: "price",
      header: t("Amount"),
      render: (value: number) => formatCurrency(value),
    },
    {
      key: "payment_status",
      header: t("Payment Status"),
      render: (value: string) => <StatusBadge status={value} type="payment" />,
    },
  ];

  return (
    <CustomerPageLayout title={t("Billing & Payment")} loading={loading}>
      <StatsGrid stats={statsData} className="mb-6" />
      
      <DataTable
        title={t("Payment History")}
        columns={tableColumns}
        data={transactions}
        emptyState={{
          icon: <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />,
          title: t("No financial transactions currently"),
          description: t("Your payment history will appear here once you start making orders"),
        }}
      />
    </CustomerPageLayout>
  );
};

const CustomerBilling = () => {
  return <CustomerBillingContent />;
};

export default CustomerBilling;
