import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import DriverSidebar from "@/components/driver/DriverSidebar";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  DollarSign,
  Package,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

type Notification = {
  id: number;
  type: "document" | "order" | "payment";
  message: string;
  date: string;
  isRead: boolean;
};

const DriverDashboardContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { user, session } = useAuth();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const {
    data: driverData,
    isLoading: isLoadingDriver,
    error: driverError,
  } = useQuery({
    queryKey: ["driver-data", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: driver, error: driverError } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", user.id)
        .single();

      if (driverError) {
        console.error("Error fetching driver data:", driverError);
        throw driverError;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile data:", profileError);
        throw profileError;
      }

      return { ...driver, profile };
    },
    enabled: !!user?.id,
  });

  // Enhanced query for financial statistics with retries and proper error handling
  const { data: financialStats, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ["driver-financial-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        // Count completed orders
        const { count: completedOrders, error: ordersError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("driver_id", user.id)
          .eq("status", "completed");

        if (ordersError) {
          console.error("Error fetching completed orders:", ordersError);
          throw ordersError;
        }

        console.log("Completed orders count:", completedOrders);

        // Get financial transactions
        const { data: transactions, error: transactionsError } = await supabase
          .from("financial_transactions")
          .select("amount, transaction_type, status")
          .eq("driver_id", user.id)
          .eq("status", "completed");

        if (transactionsError) {
          console.error("Error fetching transactions:", transactionsError);
          throw transactionsError;
        }

        console.log("Financial transactions:", transactions);

        // Calculate earnings
        const totalEarnings = transactions
          .filter((t) => t.transaction_type === "driver_payout")
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const platformCommission = transactions
          .filter((t) => t.transaction_type === "platform_fee")
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        return {
          completedOrders: completedOrders || 0,
          totalEarnings,
          platformCommission,
          availableBalance: totalEarnings - platformCommission,
        };
      } catch (error) {
        console.error("Error calculating financial stats:", error);
        // Return default values if there's an error
        return {
          completedOrders: 0,
          totalEarnings: 0,
          platformCommission: 0,
          availableBalance: 0,
        };
      }
    },
    enabled: !!user?.id,
    retry: 2,
  });

  const { data: ratingData } = useQuery({
    queryKey: ["driver-rating", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      try {
        // First try to get rating from drivers table
        const { data: driver, error } = await supabase
          .from("drivers")
          .select("rating")
          .eq("id", user.id)
          .maybeSingle();

        console.log("Driver rating from drivers table:", driver?.rating);

        if (error) {
          console.error(
            "Error fetching driver rating from drivers table:",
            error
          );
          throw error;
        }

        // If no rating in drivers table or it's null, calculate from ratings table
        if (!driver || driver.rating === null) {
          const { data: ratings, error: ratingsError } = await supabase
            .from("driver_ratings")
            .select("rating")
            .eq("driver_id", user.id);

          if (ratingsError) {
            console.error("Error fetching driver ratings:", ratingsError);
            throw ratingsError;
          }

          console.log("Driver ratings from ratings table:", ratings);

          if (ratings && ratings.length > 0) {
            const avgRating =
              ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
            return avgRating;
          }

          return 0;
        }

        return driver.rating || 0;
      } catch (error) {
        console.error("Error getting driver rating:", error);
        return 0;
      }
    },
    enabled: !!user?.id,
  });

  // Direct query to get completed orders count as a backup
  const { data: ordersCountData } = useQuery({
    queryKey: ["driver-orders-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      try {
        const { count, error } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("driver_id", user.id)
          .eq("status", "completed");

        if (error) {
          console.error("Error fetching orders count:", error);
          throw error;
        }

        console.log("Orders count direct query:", count);
        return count || 0;
      } catch (error) {
        console.error("Error counting completed orders:", error);
        return 0;
      }
    },
    enabled: !!user?.id,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["driver-notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: driver, error } = await supabase
        .from("drivers")
        .select("documents, license_image")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const notifications: Notification[] = [];

      if (driver?.documents?.national_id_expiry) {
        const expiryDate = new Date(driver.documents.national_id_expiry);
        const now = new Date();
        const daysToExpiry = Math.floor(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysToExpiry < 30) {
          notifications.push({
            id: 1,
            type: "document",
            message: "الهوية الوطنية ستنتهي قريبًا، يرجى تحديثها",
            date: expiryDate.toISOString().split("T")[0],
            isRead: false,
          });
        }
      }

      if (driver?.documents?.license_expiry) {
        const expiryDate = new Date(driver.documents.license_expiry);
        const now = new Date();
        const daysToExpiry = Math.floor(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysToExpiry < 30) {
          notifications.push({
            id: 2,
            type: "document",
            message: "رخصة القيادة ستنتهي قريبًا، يرجى تحديثها",
            date: expiryDate.toISOString().split("T")[0],
            isRead: false,
          });
        }
      }

      if (notifications.length < 3) {
        if (financialStats?.availableBalance > 0) {
          notifications.push({
            id: 3,
            type: "payment",
            message: `تم إيداع مبلغ ${financialStats.availableBalance} ريال في حسابك البنكي`,
            date: new Date().toISOString().split("T")[0],
            isRead: false,
          });
        }
      }

      return notifications;
    },
    enabled: !!user?.id && !!financialStats,
  });

  useEffect(() => {
    const checkAuthAndData = async () => {
      const driverAuth = localStorage.getItem("driverAuth");
      if (!driverAuth || driverAuth !== "true") {
        toast({
          title: "غير مصرح بالدخول",
          description: "يرجى تسجيل الدخول أولاً",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast({
            title: "غير مصرح بالدخول",
            description: "يرجى تسجيل الدخول أولاً",
            variant: "destructive",
          });
          localStorage.removeItem("driverAuth");
          navigate("/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error in driver dashboard init", error);
        toast({
          title: "خطأ في النظام",
          description: "حدث خطأ عند جلب بيانات الحساب",
          variant: "destructive",
        });
        navigate("/login");
      }
    };
    checkAuthAndData();
  }, [navigate, toast]);

  useEffect(() => {
    if (notificationsData?.length) {
      setNotifications(notificationsData);
    }
  }, [notificationsData]);

  const renderAccountStatusBanner = () => {
    if (!driverData) return null;

    if (driverData.status === "approved") {
      return (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <p className="font-medium text-green-800">
                {t("accountApproved")}
              </p>
              <p className="text-green-700 text-sm">
                {t("accountApprovedDesc")}
              </p>
            </div>
          </div>
        </div>
      );
    }
    if (driverData.status === "pending") {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-start">
            <Clock className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <p className="font-medium text-yellow-800">
                {t("accountPending")}
              </p>
              <p className="text-yellow-700 text-sm">
                {t("accountPendingDesc")}
              </p>
            </div>
          </div>
        </div>
      );
    }
    if (driverData.status === "rejected") {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="font-medium text-red-800">{t("accountRejected")}</p>
              <p className="text-red-700 text-sm">{t("accountRejectedDesc")}</p>
              {driverData.rejection_reason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800">
                    {t("rejectionReason")}
                  </h3>
                  <p className="text-red-700 mt-2">
                    {driverData.rejection_reason}
                  </p>
                </div>
              )}
              <p className="text-gray-600 mt-4">{t("reapplyNote")}</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => navigate("/driver/profile")}
              >
                {t("reapply")}
              </Button>
            </div>
          </div>
        </div>
      );
    }
    if (driverData.status === "frozen") {
      return (
        <div className="bg-red-100 border-l-4 border-red-600 p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <p className="font-bold text-red-700">{t("accountFrozen")}</p>
              <p className="mt-2 text-red-600">{t("accountFrozenDesc")}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoadingDriver || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-safedrop-primary mx-auto"></div>
          <h2 className="text-2xl font-bold">{t("loading")}</h2>
        </div>
      </div>
    );
  }

  if (driverError) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">{t("systemError")}</h2>
          <p className="text-gray-600">{t("errorLoadingAccount")}</p>
          <Button onClick={() => window.location.reload()}>
            {t("refreshPage")}
          </Button>
        </div>
      </div>
    );
  }

  // Get the completed orders count either from financialStats or direct query
  const completedOrdersCount =
    financialStats?.completedOrders || ordersCountData || 0;

  // Format the available balance to always show 2 decimal places
  const formattedBalance = (financialStats?.availableBalance || 0).toFixed(2);

  // Format the rating to show one decimal place
  const formattedRating = (ratingData || 0).toFixed(1);

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">
              {t("driverDashboardTitle")}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            {renderAccountStatusBanner()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("completedOrdersCount")}
                      </p>
                      <h3 className="text-2xl font-bold">
                        {isLoadingFinancial ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          completedOrdersCount
                        )}
                      </h3>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("rating")}
                      </p>
                      <div
                        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate("/driver/ratings")}
                      >
                        <h3 className="text-2xl font-bold">
                          {formattedRating}
                        </h3>
                        <div className="text-yellow-500 ml-2 text-lg">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <span key={i}>
                                {i < Math.round(ratingData || 0) ? "★" : "☆"}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                    <div
                      className="bg-yellow-100 p-3 rounded-full cursor-pointer hover:bg-yellow-200 transition-colors"
                      onClick={() => navigate("/driver/ratings")}
                    >
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("availableBalance")}
                      </p>
                      <h3 className="text-2xl font-bold" dir="ltr">
                        {isLoadingFinancial ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          `${formattedBalance} ر.س`
                        )}
                      </h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications and financial summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("notifications")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <div className="text-center p-6">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">{t("noNotifications")}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start p-3 rounded-lg ${
                            notification.isRead ? "bg-white" : "bg-blue-50"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-full ${
                              notification.type === "document"
                                ? "bg-yellow-100 text-yellow-600"
                                : notification.type === "order"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {notification.type === "document" && (
                              <AlertTriangle className="h-5 w-5" />
                            )}
                            {notification.type === "order" && (
                              <Bell className="h-5 w-5" />
                            )}
                            {notification.type === "payment" && (
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <p
                              className={`text-sm ${
                                notification.isRead
                                  ? "font-normal"
                                  : "font-medium"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {notification.date}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <Badge className="bg-blue-500">جديد</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => navigate("/driver/notifications")}
                  >
                    {t("viewAllNotifications")}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("earningsSummary")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">{t("totalEarnings")}</p>
                      <p className="font-medium">
                        {isLoadingFinancial ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          `${
                            financialStats?.totalEarnings.toFixed(2) || "0.00"
                          } ر.س`
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">{t("platformFee")}</p>
                      <p className="font-medium">
                        {isLoadingFinancial ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          `${
                            financialStats?.platformCommission.toFixed(2) ||
                            "0.00"
                          } ر.س`
                        )}
                      </p>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between font-medium">
                        <p>{t("availableBalance")}</p>
                        <p>
                          {isLoadingFinancial ? (
                            <span className="animate-pulse">...</span>
                          ) : (
                            `${
                              financialStats?.availableBalance.toFixed(2) ||
                              "0.00"
                            } ر.س`
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex mt-6 gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate("/driver/earnings")}
                    >
                      {t("paymentDetails")}
                    </Button>
                    <Button
                      className="bg-safedrop-gold hover:bg-safedrop-gold/90 flex-1"
                      onClick={() =>
                        toast({
                          title: t("withdrawalRequestSent"),
                          variant: "default",
                          className: "bg-green-500 text-white",
                        })
                      }
                    >
                      {t("requestWithdrawal")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Support card */}
            <Card>
              <CardHeader>
                <CardTitle>{t("supportAndHelp")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex items-center justify-center gap-2"
                    onClick={() => navigate("/driver/support")}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>{t("contactSupport")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex items-center justify-center gap-2"
                    onClick={() => navigate("/faq")}
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span>{t("faq")}</span>
                  </Button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {t("havingProblem")}
                  </p>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate("/driver/support/report-issue")}
                  >
                    {t("reportIssue")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverDashboard = () => {
  return <DriverDashboardContent />;
};

export default DriverDashboard;
