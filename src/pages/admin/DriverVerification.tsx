import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/ui/language-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  AlertTriangle,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Driver, ResponsiveDriversTable, exportDriversToCSV, getUserName } from "@/components/admin";

interface DriverStatusCategory {
  name: string;
  display_name_ar: string;
  color: string;
}

const DriverVerification = () => {
  const { t } = useLanguage();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [statusCategories, setStatusCategories] = useState<
    DriverStatusCategory[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDriverStatusCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("driver_status_categories")
        .select("name, display_name_ar, color");
      if (error) throw error;
      setStatusCategories(data || []);
    } catch (error) {
      console.error("Error fetching driver status categories:", error);
      toast.error(t("errorFetchingStatusCategories"));
    }
  };

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: roleMappings, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "driver");
      if (roleError) {
        console.error("Error fetching driver roles:", roleError);
      }
      const driverRoleIds = roleMappings
        ? roleMappings.map((r) => r.user_id)
        : [];

      let profilesQuery = supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, phone, user_type, email, created_at"
        );

      if (driverRoleIds.length > 0) {
        profilesQuery = profilesQuery.or(
          `user_type.eq.driver,id.in.(${driverRoleIds.join(",")})`
        );
      } else {
        profilesQuery = profilesQuery.eq("user_type", "driver");
      }

      const { data: profilesData, error: profilesError } = await profilesQuery;
      if (profilesError) throw profilesError;

      if (!profilesData || profilesData.length === 0) {
        setDrivers([]);
        setLoading(false);
        return;
      }

      const driverIds = profilesData.map((d) => d.id);
      const { data: driversData, error: driversError } = await supabase
        .from("drivers")
        .select(
          "id, status, created_at, updated_at,subscription_status, subscription_plan, subscription_amount, subscription_activated_at, subscription_expires_at"
        )
        .in("id", driverIds);

      if (driversError) throw driversError;

      const driverStatusMap = {};
      const driverDatesMap = {};

      if (driversData) {
        driversData.forEach((driver) => {
          driverStatusMap[driver.id] = driver.status;
          driverDatesMap[driver.id] = {
            created_at: driver.created_at,
            updated_at: driver.updated_at,
          };
        });
      }
      const driversCombined = driversData.map((driver) => {
        const profile = profilesData.find((p) => p.id === driver.id);
        return {
          ...profile,
          ...driver,
        };
      });

      setDrivers(driversCombined);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setError(t("errorFetchingDrivers"));
      toast.error(t("errorFetchingDrivers"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverStatusCategories();
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (error) {
      console.error("Error with drivers:", error);
    }
  }, [error]);

  const filteredDrivers = drivers.filter((driver) => {
    const userName = getUserName(driver, t);

    const matchesSearch =
      !searchTerm ||
      driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm);

    return matchesSearch;
  });

  const navigateToDriverDetails = (driverId: string) => {
    navigate(`/admin/driver-details/${driverId}`);
  };

  const handleExportDrivers = () => {
    const success = exportDriversToCSV(drivers, t);
    if (success) {
      toast.success(t("exportSuccess"));
    }
  };

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-red-500">
                <AlertTriangle className="h-12 w-12 mx-auto" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  {t("errorLoadingData")}
                </h3>
                <p className="text-red-600 mb-4">
                  {t("errorLoadingDriversMessage")}
                </p>
                <Button
                  onClick={() => fetchDrivers()}
                  variant="outline"
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  {t("retryLoading")}
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
          <div className="flex flex-col lg:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {t("driversManagement")}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {t("driversManagementDescription")}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              {/* Search */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("searchDriverPlaceholder")}
                  className="pr-10 text-left"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Export Button */}
              <Button
                variant="outline"
                className="gap-2 whitespace-nowrap"
                onClick={handleExportDrivers}
                disabled={drivers.length === 0}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">{t("exportDrivers")}</span>
                <span className="sm:hidden">{t("export")}</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">
                    {drivers.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("totalDrivers")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                    {drivers.filter((d) => d.status === "pending").length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("pendingReview")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    {drivers.filter((d) => d.status === "approved").length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("approved")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-red-600">
                    {drivers.filter((d) => d.status === "rejected").length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("rejected")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-500">{t("loadingDriversText")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Main Content */
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl">
                {t("searchResultsCount")
                  .replace("{count}", filteredDrivers.length.toString())
                  .replace("{total}", drivers.length.toString())}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 lg:p-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-6 grid grid-cols-2 sm:grid-cols-4 w-full max-w-none lg:max-w-3xl">
                  <TabsTrigger
                    value="pending"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">
                      {t("pendingReview")}
                    </span>
                    <span className="sm:hidden">{t("pending")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredDrivers.filter((d) => d.status === "pending")
                          .length
                      }
                      )
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="approved"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">{t("approved")}</span>
                    <span className="sm:hidden">{t("approved")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredDrivers.filter((d) => d.status === "approved")
                          .length
                      }
                      )
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="rejected"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">{t("rejected")}</span>
                    <span className="sm:hidden">{t("rejected")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredDrivers.filter((d) => d.status === "rejected")
                          .length
                      }
                      )
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="all"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">{t("allDrivers")}</span>
                    <span className="sm:hidden">{t("all")}</span>
                    <span className="ml-1 rtl:mr-1">
                      ({filteredDrivers.length})
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-0">
                  <ResponsiveDriversTable
                    drivers={filteredDrivers}
                    statusCategories={statusCategories}
                    status="pending"
                    onViewDriver={navigateToDriverDetails}
                  />
                </TabsContent>

                <TabsContent value="approved" className="mt-0">
                  <ResponsiveDriversTable
                    drivers={filteredDrivers}
                    statusCategories={statusCategories}
                    status="approved"
                    onViewDriver={navigateToDriverDetails}
                  />
                </TabsContent>

                <TabsContent value="rejected" className="mt-0">
                  <ResponsiveDriversTable
                    drivers={filteredDrivers}
                    statusCategories={statusCategories}
                    status="rejected"
                    onViewDriver={navigateToDriverDetails}
                  />
                </TabsContent>

                <TabsContent value="all" className="mt-0">
                  <ResponsiveDriversTable
                    drivers={filteredDrivers}
                    statusCategories={statusCategories}
                    status="all"
                    onViewDriver={navigateToDriverDetails}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DriverVerification;
