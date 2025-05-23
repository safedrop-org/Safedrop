import { useState, useEffect } from "react";
import { useLanguage } from "@/components/ui/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DriverSidebar from "@/components/driver/DriverSidebar";
import { Clock, AlertTriangle, MapPin, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import OrderDetailsCard from "@/components/driver/OrderDetailsCard";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LanguageProvider } from "@/components/ui/language-context";

// Move the component content to be inside a component that is used only after LanguageProvider is initialized
const DriverOrdersContent = () => {
  const { t } = useLanguage();
  const [isAvailable, setIsAvailable] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading, error, refetch } = useOrders();
  const [activeTab, setActiveTab] = useState("current");
  const [lastAcceptedOrderId, setLastAcceptedOrderId] = useState<string | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  // Location state
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);

  // Request location permission and start tracking
  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError(
        t("locationNotSupported") || "الموقع الجغرافي غير مدعوم في هذا المتصفح"
      );
      toast.error(
        t("locationNotSupported") || "الموقع الجغرافي غير مدعوم في هذا المتصفح"
      );
      return;
    }

    setIsRequestingLocation(true);
    setLocationError(null);

    try {
      // Request high accuracy location
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setDriverLocation(location);
      setLocationError(null);
      toast.success(
        t("locationEnabledSuccessfully") || "تم تفعيل الموقع الجغرافي بنجاح"
      );

      // Start watching position for continuous updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Location watch error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000,
        }
      );

      setLocationWatchId(watchId);
    } catch (error: any) {
      console.error("Location request error:", error);
      let errorMessage =
        t("locationRequestFailed") || "فشل في الحصول على الموقع الجغرافي";

      switch (error.code) {
        case 1: // PERMISSION_DENIED
          errorMessage =
            t("locationPermissionDenied") ||
            "تم رفض الإذن للوصول للموقع الجغرافي";
          break;
        case 2: // POSITION_UNAVAILABLE
          errorMessage = t("locationUnavailable") || "الموقع الجغرافي غير متاح";
          break;
        case 3: // TIMEOUT
          errorMessage =
            t("locationTimeout") || "انتهت مهلة الحصول على الموقع الجغرافي";
          break;
      }

      setLocationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRequestingLocation(false);
    }
  };

  // Auto-request location on component mount
  useEffect(() => {
    if (user?.id && !driverLocation && !locationError) {
      requestLocation();
    }

    // Cleanup location watch on unmount
    return () => {
      if (locationWatchId) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
  }, [user?.id]);

  // Fetch driver's current availability status on component mount
  useEffect(() => {
    const fetchDriverStatus = async () => {
      if (!user?.id) return;

      try {
        const { data: driverData, error } = await supabase
          .from("drivers")
          .select("is_available, status")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching driver status:", error);
          return;
        }

        if (driverData) {
          // Only set available if driver is approved
          setIsAvailable(
            driverData.status === "approved" && driverData.is_available === true
          );
        }
      } catch (err) {
        console.error("Error in fetchDriverStatus:", err);
      }
    };

    fetchDriverStatus();
  }, [user?.id]);

  // Update driver availability when toggle changes
  const updateDriverAvailability = async (newAvailability: boolean) => {
    if (!user?.id || updatingAvailability) return;

    setUpdatingAvailability(true);

    try {
      // First check if driver is approved
      const { data: driverCheck, error: checkError } = await supabase
        .from("drivers")
        .select("status")
        .eq("id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking driver status:", checkError);
        toast.error(
          t("errorCheckingDriverStatus") || "خطأ في التحقق من حالة السائق"
        );
        setUpdatingAvailability(false);
        return;
      }

      if (!driverCheck || driverCheck.status !== "approved") {
        toast.error(
          t("driverNotApproved") ||
            "يجب الموافقة على حسابك من قبل الإدارة أولاً"
        );
        setIsAvailable(false);
        setUpdatingAvailability(false);
        return;
      }

      // Update availability
      const { error: updateError } = await supabase
        .from("drivers")
        .update({
          is_available: newAvailability,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating driver availability:", updateError);
        toast.error(
          t("errorUpdatingAvailability") || "خطأ في تحديث حالة التوفر"
        );
        // Revert the state
        setIsAvailable(!newAvailability);
      } else {
        setIsAvailable(newAvailability);
        toast.success(
          newAvailability
            ? t("nowAvailableForOrders") || "أنت متاح الآن لاستلام الطلبات"
            : t("nowNotAvailableForOrders") || "أنت غير متاح لاستلام الطلبات"
        );
      }
    } catch (err) {
      console.error("Error in updateDriverAvailability:", err);
      toast.error(t("errorUpdatingAvailability") || "خطأ في تحديث حالة التوفر");
      // Revert the state
      setIsAvailable(!newAvailability);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  // Handle availability toggle
  const handleAvailabilityToggle = () => {
    if (updatingAvailability) return;
    const newAvailability = !isAvailable;
    updateDriverAvailability(newAvailability);
  };

  useEffect(() => {
    if (orders && orders.length > 0) {
      console.log("Orders loaded:", orders.length, "orders");
      console.log("Orders data:", orders);
    } else {
      console.log("No orders found or orders array is empty");
    }
  }, [orders]);

  // Filter orders more safely
  const availableOrders = Array.isArray(orders)
    ? orders.filter(
        (order) => !order.driver_id && order.status === "available" && order.id // Ensure order has an ID
      )
    : [];

  const currentOrders = Array.isArray(orders)
    ? orders.filter(
        (order) =>
          order.driver_id === user?.id &&
          ["picked_up", "in_transit", "approaching"].includes(order.status) &&
          order.id // Ensure order has an ID
      )
    : [];

  const completedOrders = Array.isArray(orders)
    ? orders.filter(
        (order) =>
          order.driver_id === user?.id &&
          order.status === "completed" &&
          order.id // Ensure order has an ID
      )
    : [];

  console.log("Filtered orders:", {
    available: availableOrders.length,
    current: currentOrders.length,
    completed: completedOrders.length,
    total: orders?.length || 0,
  });

  useEffect(() => {
    if (currentOrders.length > 0) {
      setActiveTab("current");
      setLastAcceptedOrderId(null);
    }
  }, [currentOrders.length]);

  const handleAcceptOrder = async (id: string) => {
    if (isProcessing) {
      console.log("Already processing, skipping...");
      return;
    }

    if (!user?.id) {
      toast.error(
        t("mustLoginToAcceptOrder") || "يجب تسجيل الدخول لقبول الطلب"
      );
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Accepting order:", id, "with driver:", user.id);

      // Check if order is still available
      const { data: orderCheck, error: checkError } = await supabase
        .from("orders")
        .select("id, status, driver_id")
        .eq("id", id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking order status:", checkError);
        toast.error(
          t("errorCheckingOrderStatus") || "حدث خطأ أثناء التحقق من حالة الطلب"
        );
        return;
      }

      if (!orderCheck) {
        console.error("Order not found in database");
        toast.error(t("orderNotFound") || "لم يتم العثور على الطلب");
        return;
      }

      if (orderCheck.status !== "available" || orderCheck.driver_id) {
        console.error(
          "Order is no longer available for acceptance",
          orderCheck
        );
        toast.error(
          t("orderNoLongerAvailable") || "هذا الطلب لم يعد متاحاً للقبول"
        );
        return;
      }

      // Update order with driver assignment
      const { data: updateData, error: updateError } = await supabase
        .from("orders")
        .update({
          driver_id: user.id,
          status: "picked_up",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (updateError) {
        console.error("Error accepting order:", updateError);
        toast.error(t("errorAcceptingOrder") || "حدث خطأ أثناء قبول الطلب");
        return;
      }

      console.log("Order update response:", updateData);

      if (!updateData || updateData.length === 0) {
        console.error("No data returned from update operation");
        toast.error(
          t("errorAcceptingOrderNoData") ||
            "حدث خطأ أثناء قبول الطلب - لم يتم العثور على الطلب"
        );
        return;
      }

      toast.success(
        t("orderAcceptedSuccessfully") ||
          `تم قبول الطلب رقم ${id.substring(0, 8)} بنجاح`
      );
      setLastAcceptedOrderId(id);

      // Refresh orders data
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      await refetch();

      // Switch to current orders tab
      setActiveTab("current");
    } catch (err) {
      console.error("Error accepting order:", err);
      toast.error(t("errorAcceptingOrder") || "حدث خطأ أثناء قبول الطلب");
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DriverSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {t("loadingOrders") || "جاري تحميل الطلبات..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DriverSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">
              {t("errorLoadingOrders") || "خطأ في تحميل الطلبات"}
            </p>
            <Button onClick={() => refetch()}>
              {t("tryAgain") || "حاول مرة أخرى"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {t("manageOrders")}
            </h1>
            <div className="flex items-center gap-4">
              {/* Location Status */}
              <div className="flex items-center gap-2">
                <MapPin
                  className={`h-4 w-4 ${
                    driverLocation ? "text-green-500" : "text-red-500"
                  }`}
                />
                <span className="text-sm">
                  {driverLocation ? "الموقع مفعل" : "الموقع غير مفعل"}
                </span>
                {!driverLocation && !isRequestingLocation && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={requestLocation}
                    className="text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    تفعيل الموقع
                  </Button>
                )}
                {isRequestingLocation && (
                  <div className="flex items-center gap-1">
                    <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full"></div>
                    <span className="text-xs">جاري التحديد...</span>
                  </div>
                )}
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm">{t("availabilityStatus")}:</span>
                <div
                  className={`relative h-6 w-12 cursor-pointer rounded-full transition-colors duration-200 ${
                    updatingAvailability
                      ? "bg-gray-300 cursor-not-allowed"
                      : isAvailable
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                  onClick={handleAvailabilityToggle}
                >
                  <div
                    className={`absolute transition-transform duration-200 h-5 w-5 top-0.5 rounded-full bg-white ${
                      isAvailable ? "right-0.5" : "left-0.5"
                    }`}
                  />
                  {updatingAvailability && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isAvailable ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {isAvailable
                    ? t("availableForOrders")
                    : t("notAvailableForOrders")}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Location Error Alert */}
        {locationError && (
          <div className="bg-red-50 border border-red-200 p-4 mx-4 mt-4 rounded-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-2">
                  {t("locationError") || "خطأ في الموقع الجغرافي"}
                </h3>
                <div className="text-red-700 text-sm whitespace-pre-line leading-relaxed">
                  {locationError}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={requestLocation}
                    disabled={isRequestingLocation}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    {t("retry") || "إعادة المحاولة"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    {t("refreshPage") || "تحديث الصفحة"}
                  </Button>
                </div>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-xs">
                  <strong>
                    {t("howToEnableLocation") || "كيفية تفعيل الموقع:"}{" "}
                  </strong>
                  <br />•{" "}
                  {t("clickLockIcon") ||
                    "اضغط على أيقونة القفل 🔒 في شريط العنوان"}
                  <br />•{" "}
                  {t("chooseAllowLocation") || "اختر السماح للموقع الجغرافي"}
                  <br />• {t("refreshPage") || "اضغط تحديث الصفحة أدناه"}
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="current">
                  {t("currentOrdersTab")} ({currentOrders.length})
                </TabsTrigger>
                <TabsTrigger value="available">
                  {t("availableOrdersTab")} ({availableOrders.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  {t("completedOrdersTab")} ({completedOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">
                  {t("currentOrdersTab")}
                </h3>
                {currentOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">
                        {t("noCurrentOrders") || "لا توجد طلبات حالية"}
                      </p>
                      <Button
                        variant="default"
                        className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                        onClick={() => setActiveTab("available")}
                      >
                        {t("browseAvailableOrders")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  currentOrders.map((order) => (
                    <OrderDetailsCard
                      key={order.id}
                      order={order}
                      onOrderUpdate={refetch}
                      driverLocation={driverLocation}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="available" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">
                  {t("availableOrdersTab")}
                </h3>
                {!isAvailable ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                      <p className="text-gray-600 mb-4">
                        {t("notAvailableMessage")}
                      </p>
                      <Button
                        variant="default"
                        className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                        onClick={handleAvailabilityToggle}
                        disabled={updatingAvailability}
                      >
                        {updatingAvailability
                          ? t("updating") || "جاري التحديث..."
                          : t("changeToAvailable")}
                      </Button>
                    </div>
                  </div>
                ) : availableOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">{t("noAvailableOrders")}</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => refetch()}
                      >
                        {t("refreshOrders") || "تحديث الطلبات"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  availableOrders.map((order) => (
                    <OrderDetailsCard
                      key={order.id}
                      order={order}
                      onOrderUpdate={refetch}
                      driverLocation={driverLocation}
                      showAcceptButton={true}
                      onAcceptOrder={handleAcceptOrder}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">
                  {t("completedOrdersTab")}
                </h3>
                {completedOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">
                        {t("noCompletedOrders") || "لا توجد طلبات مكتملة"}
                      </p>
                    </div>
                  </div>
                ) : (
                  completedOrders.map((order) => (
                    <OrderDetailsCard
                      key={order.id}
                      order={order}
                      onOrderUpdate={refetch}
                      driverLocation={driverLocation}
                      showCompleteButton={false}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

// The main component exported from this file
const DriverOrders = () => {
  return (
    <LanguageProvider>
      <DriverOrdersContent />
    </LanguageProvider>
  );
};

export default DriverOrders;
