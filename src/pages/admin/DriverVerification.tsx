import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Search,
  RefreshCw,
  User,
  Phone,
  Mail,
  Shield,
  AlertTriangle,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: string | null;
  email?: string | null;
  user_type: string;
}

interface DriverStatusCategory {
  name: string;
  display_name_ar: string;
  color: string;
}

// Mobile Card Component
const MobileDriverCard: React.FC<{
  driver: Driver;
  statusCategories: DriverStatusCategory[];
  language: string;
  onViewDriver: (driverId: string) => void;
  t: (key: string) => string;
}> = ({ driver, statusCategories, language, onViewDriver, t }) => {
  const statusCategory = statusCategories.find(
    (cat) => cat.name === driver.status
  );

  const getStatusBadgeStyle = (status: string) => {
    const category = statusCategories.find((cat) => cat.name === status);
    const color = category ? category.color : "#6c757d";
    return {
      backgroundColor: color,
      color: "#ffffff",
      border: "none",
    };
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-bold text-lg">
                {driver.first_name} {driver.last_name}
              </span>
            </div>
            <Badge
              style={getStatusBadgeStyle(driver.status || "pending")}
              className="text-white border-0 text-xs"
            >
              {language === "ar"
                ? statusCategory?.display_name_ar || driver.status
                : statusCategory?.name || driver.status}
            </Badge>
          </div>

          {/* Driver Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("emailLabel")}:</span>
              <span className="font-medium">
                {driver.email || t("notSpecified")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("phoneLabel")}:</span>
              <span className="font-medium">{driver.phone}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("userTypeLabel")}:</span>
              <span className="font-medium">{driver.user_type}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDriver(driver.id)}
              className="w-full gap-2"
            >
              <Eye className="h-4 w-4" />
              {t("viewFullDriverDetails")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Responsive Table Component
interface DriversTableProps {
  drivers: Driver[];
  statusCategories: DriverStatusCategory[];
  language: string;
  status?: "all" | "pending" | "approved" | "rejected";
  onViewDriver: (driverId: string) => void;
  t: (key: string) => string;
}

const ResponsiveDriversTable: React.FC<DriversTableProps> = ({
  drivers,
  statusCategories,
  language,
  status = "all",
  onViewDriver,
  t,
}) => {
  const filteredDrivers =
    status === "all"
      ? drivers
      : drivers.filter((driver) => driver.status === status);

  const getStatusBadgeStyle = (status: string) => {
    const category = statusCategories.find((cat) => cat.name === status);
    const color = category ? category.color : "#6c757d";
    return {
      backgroundColor: color,
      color: "#ffffff",
      border: "none",
    };
  };

  if (filteredDrivers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <User className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-500 text-lg">{t("noDriversInCategory")}</p>
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
                <TableHead className="text-center whitespace-nowrap min-w-[140px] font-bold">
                  {t("firstName")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[140px] font-bold">
                  {t("lastName")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[200px] font-bold">
                  {t("email")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[120px] font-bold">
                  {t("phone")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[120px] font-bold">
                  {t("userType")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[120px] font-bold">
                  {t("status")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                  {t("Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => {
                const statusCategory = statusCategories.find(
                  (cat) => cat.name === driver.status
                );
                return (
                  <TableRow key={driver.id} className="hover:bg-gray-50">
                    <TableCell className="text-center">
                      <div
                        className="max-w-[140px] truncate"
                        title={driver.first_name}
                      >
                        {driver.first_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className="max-w-[140px] truncate"
                        title={driver.last_name}
                      >
                        {driver.last_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className="max-w-[200px] truncate"
                        title={driver.email || t("notSpecified")}
                      >
                        {driver.email || t("notSpecified")}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {driver.phone}
                    </TableCell>
                    <TableCell className="text-center">
                      {driver.user_type}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        style={getStatusBadgeStyle(driver.status || "pending")}
                        className="text-white border-0 whitespace-nowrap text-xs"
                      >
                        {language === "ar"
                          ? statusCategory?.display_name_ar || driver.status
                          : statusCategory?.name || driver.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDriver(driver.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
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
                  {t("driverName")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("email")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("phone")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("status")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => {
                const statusCategory = statusCategories.find(
                  (cat) => cat.name === driver.status
                );
                return (
                  <TableRow key={driver.id} className="hover:bg-gray-50">
                    <TableCell className="text-center">
                      <div
                        className="max-w-[120px] truncate"
                        title={`${driver.first_name} ${driver.last_name}`}
                      >
                        {driver.first_name} {driver.last_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className="max-w-[150px] truncate"
                        title={driver.email || t("notSpecified")}
                      >
                        {driver.email || t("notSpecified")}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {driver.phone}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        style={getStatusBadgeStyle(driver.status || "pending")}
                        className="text-white border-0 whitespace-nowrap text-xs"
                      >
                        {language === "ar"
                          ? statusCategory?.display_name_ar || driver.status
                          : statusCategory?.name || driver.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDriver(driver.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
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
                  {t("driverName")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("status")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("phone")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => {
                const statusCategory = statusCategories.find(
                  (cat) => cat.name === driver.status
                );
                return (
                  <TableRow key={driver.id} className="hover:bg-gray-50">
                    <TableCell className="text-center">
                      <div
                        className="max-w-[100px] truncate text-xs"
                        title={`${driver.first_name} ${driver.last_name}`}
                      >
                        {driver.first_name} {driver.last_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        style={getStatusBadgeStyle(driver.status || "pending")}
                        className="text-white border-0 text-xs"
                      >
                        {(language === "ar"
                          ? statusCategory?.display_name_ar || driver.status
                          : statusCategory?.name || driver.status
                        )?.length > 8
                          ? (language === "ar"
                              ? statusCategory?.display_name_ar || driver.status
                              : statusCategory?.name || driver.status
                            )?.substring(0, 8) + "..."
                          : language === "ar"
                          ? statusCategory?.display_name_ar || driver.status
                          : statusCategory?.name || driver.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {driver.phone}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDriver(driver.id)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards - Small screens */}
      <div className="block md:hidden space-y-4">
        {filteredDrivers.map((driver) => (
          <MobileDriverCard
            key={driver.id}
            driver={driver}
            statusCategories={statusCategories}
            language={language}
            onViewDriver={onViewDriver}
            t={t}
          />
        ))}
      </div>
    </>
  );
};

const DriverVerification = () => {
  const { t, language } = useLanguage();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [statusCategories, setStatusCategories] = useState<
    DriverStatusCategory[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [currentTab, setCurrentTab] = useState("pending");
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
        .select("id, first_name, last_name, phone, user_type, email");
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
        .select("id, status")
        .in("id", driverIds);
      if (driversError) throw driversError;
      const driverStatusMap = {};
      if (driversData) {
        driversData.forEach((driver) => {
          driverStatusMap[driver.id] = driver.status;
        });
      }
      const driversCombined = profilesData.map((profile) => {
        return {
          ...profile,
          status: driverStatusMap[profile.id] ?? "pending",
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
    const matchesStatus = currentTab === "all" || driver.status === currentTab;
    const matchesSearch =
      !searchEmail ||
      (driver.email &&
        driver.email.toLowerCase().includes(searchEmail.toLowerCase())) ||
      `${driver.first_name} ${driver.last_name}`
        .toLowerCase()
        .includes(searchEmail.toLowerCase()) ||
      driver.phone.includes(searchEmail);
    return matchesStatus && matchesSearch;
  });

  const navigateToDriverDetails = (driverId: string) => {
    navigate(`/admin/driver-details/${driverId}`);
  };

  const handleExportDrivers = () => {
    const headers = [
      t("firstName"),
      t("lastName"),
      t("email"),
      t("phone"),
      t("userType"),
      t("status"),
    ];

    const csvData = drivers.map((driver) => [
      driver.first_name,
      driver.last_name,
      driver.email || t("notSpecified"),
      driver.phone,
      driver.user_type,
      driver.status || "pending",
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
      `drivers-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t("driversExportedSuccessfully"));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
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
                    {t("retryAction")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
                  className="pr-10"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
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
                    {t("pendingDrivers")}
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
                    {t("approvedDrivers")}
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
                    {t("rejectedDrivers")}
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
                {t("searchResults")} ({filteredDrivers.length} {t("of")}{" "}
                {drivers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 lg:p-6">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="mb-6 grid grid-cols-2 sm:grid-cols-4 w-full max-w-none lg:max-w-3xl">
                  <TabsTrigger
                    value="pending"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">
                      {t("pendingDrivers")}
                    </span>
                    <span className="sm:hidden">{t("pending")}</span>
                    <span className="mr-1">
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
                    <span className="hidden sm:inline">
                      {t("approvedDrivers")}
                    </span>
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
                    <span className="hidden sm:inline">
                      {t("rejectedDrivers")}
                    </span>
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
                    language={language}
                    status="pending"
                    onViewDriver={navigateToDriverDetails}
                    t={t}
                  />
                </TabsContent>

                <TabsContent value="approved" className="mt-0">
                  <ResponsiveDriversTable
                    drivers={filteredDrivers}
                    statusCategories={statusCategories}
                    language={language}
                    status="approved"
                    onViewDriver={navigateToDriverDetails}
                    t={t}
                  />
                </TabsContent>

                <TabsContent value="rejected" className="mt-0">
                  <ResponsiveDriversTable
                    drivers={filteredDrivers}
                    statusCategories={statusCategories}
                    language={language}
                    status="rejected"
                    onViewDriver={navigateToDriverDetails}
                    t={t}
                  />
                </TabsContent>

                <TabsContent value="all" className="mt-0">
                  <ResponsiveDriversTable
                    drivers={filteredDrivers}
                    statusCategories={statusCategories}
                    language={language}
                    status="all"
                    onViewDriver={navigateToDriverDetails}
                    t={t}
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
