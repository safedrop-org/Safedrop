import React, { useState } from "react";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { useCustomerOrders } from "@/hooks/useCustomerOrders";
import {
  OrderTable,
  CancelOrderDialog,
  LoadingSpinner,
} from "@/components/customer/common";

const CustomerOrdersContent = () => {
  const { t, language } = useLanguage();
  const {
    activeOrders,
    historyOrders,
    loading,
    completeOrder,
    cancelOrder,
  } = useCustomerOrders(language);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  const handleCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
    setShowCancelDialog(true);
  };

  const handleCompleteOrder = async (orderId: string) => {
    await completeOrder(orderId);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    await cancelOrder(orderToCancel);
    setShowCancelDialog(false);
    setOrderToCancel(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">
          {t("orders")}
        </h1>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="active">{t("Active Orders")}</TabsTrigger>
              <TabsTrigger value="history">{t("Order History")}</TabsTrigger>
            </TabsList>

            <TabsContent
              value="active"
              className="bg-white p-4 rounded-lg shadow"
            >
              <h3 className="text-xl font-semibold mb-4">
                {t("Active Orders")}
              </h3>
              <OrderTable
                orders={activeOrders}
                onCancelOrder={handleCancelOrder}
                onCompleteOrder={handleCompleteOrder}
                showActions={true}
              />
            </TabsContent>

            <TabsContent
              value="history"
              className="bg-white p-4 rounded-lg shadow"
            >
              <h3 className="text-xl font-semibold mb-4">
                {t("Order History")}
              </h3>
              <OrderTable
                orders={historyOrders}
                showActions={false}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Cancel Order Confirmation Dialog */}
      <CancelOrderDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={confirmCancelOrder}
        loading={loading}
      />
    </div>
  );
};

const CustomerOrders = () => {
  return (
    <LanguageProvider>
      <CustomerOrdersContent />
    </LanguageProvider>
  );
};

export default CustomerOrders;
