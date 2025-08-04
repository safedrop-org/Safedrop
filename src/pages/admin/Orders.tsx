import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Download,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useOrders } from "@/hooks/useOrders";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { toast } from "sonner";
import { useLanguage } from "@/components/ui/language-context";
import { 
  OrdersTable, 
  useOrderExport
} from "@/components/admin";

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

// Main Orders Component
const Orders: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { data: orders = [], isLoading, error, refetch } = useOrders(true);
  const { exportOrders } = useOrderExport();

  React.useEffect(() => {
    if (error) {
      console.error("Error fetching orders:", error);
      toast.error(t("errorLoadingOrders"));
    }
  }, [error, t]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleOrderStatusUpdate = () => {
    refetch();
    toast.success(t("orderUpdatedSuccessfully"));
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleExportOrders = () => {
    exportOrders(orders);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.order_number &&
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer &&
        `${order.customer.first_name} ${order.customer.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (order.driver &&
        `${order.driver.first_name} ${order.driver.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-red-500">
                <AlertTriangle className="h-12  w-12 mx-auto" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  {t("errorLoadingData")}
                </h3>
                <p className="text-red-600 mb-4">
                  {t("errorLoadingOrdersMessage")}
                </p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  {t("retryAction")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {t("ordersManagement")}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {t("ordersManagementDescription")}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("searchOrder")}
                className="pr-10 text-left"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="gap-2 whitespace-nowrap"
              onClick={handleExportOrders}
              disabled={orders.length === 0}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t("exportOrders")}</span>
              <span className="sm:hidden">{t("export")}</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">
                    {orders.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("totalOrders")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">
                    {orders.filter((o) => o.status === "available").length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("availableForDelivery")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-orange-600">
                    {
                      orders.filter((o) =>
                        ["picked_up", "approaching", "in_transit"].includes(
                          o.status
                        )
                      ).length
                    }
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("inDelivery")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    {orders.filter((o) => o.status === "completed").length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("completed")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-500">{t("loadingOrdersText")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Main Content */
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl">
                {t("searchResults")} ({filteredOrders.length} {t("of")}{" "}
                {orders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 lg:p-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-6 grid grid-cols-3 sm:grid-cols-5 w-full max-w-none lg:max-w-4xl">
                  <TabsTrigger
                    value="all"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">{t("allOrders")}</span>
                    <span className="sm:hidden">{t("all")}</span>
                    <span className="ml-1 rtl:mr-1">
                      ({filteredOrders.length})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="available"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">{t("available")}</span>
                    <span className="sm:hidden">{t("available")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredOrders.filter((o) => o.status === "available")
                          .length
                      }
                      )
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="picked_up"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">{t("inProgress")}</span>
                    <span className="sm:hidden">{t("inProgress")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredOrders.filter((o) => o.status === "picked_up")
                          .length
                      }
                      )
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="approaching"
                    className="text-xs sm:text-sm px-2 sm:px-4 hidden sm:flex"
                  >
                    <span className="hidden lg:inline">{t("approaching")}</span>
                    <span className="lg:hidden">{t("enRoute")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredOrders.filter((o) => o.status === "approaching")
                          .length
                      }
                      )
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">{t("completed")}</span>
                    <span className="sm:hidden">{t("done")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredOrders.filter((o) => o.status === "completed")
                          .length
                      }
                      )
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <OrdersTable
                    orders={filteredOrders}
                    status="all"
                    onViewOrder={handleViewOrder}
                  />
                </TabsContent>

                <TabsContent value="available" className="mt-0">
                  <OrdersTable
                    orders={filteredOrders}
                    status="available"
                    onViewOrder={handleViewOrder}
                  />
                </TabsContent>

                <TabsContent value="picked_up" className="mt-0">
                  <OrdersTable
                    orders={filteredOrders}
                    status="picked_up"
                    onViewOrder={handleViewOrder}
                  />
                </TabsContent>

                <TabsContent value="approaching" className="mt-0">
                  <OrdersTable
                    orders={filteredOrders}
                    status="approaching"
                    onViewOrder={handleViewOrder}
                  />
                </TabsContent>

                <TabsContent value="completed" className="mt-0">
                  <OrdersTable
                    orders={filteredOrders}
                    status="completed"
                    onViewOrder={handleViewOrder}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            isOpen={isDetailsOpen}
            onClose={handleCloseDetails}
            onStatusUpdate={handleOrderStatusUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;
