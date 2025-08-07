import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, User, Car } from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";
import { DriverMobileCard, Driver } from "./DriverMobileCard";
import { formatDate, formatCurrency, getUserName, getStatusBadgeStyle } from "./common/utils";

interface DriverStatusCategory {
  name: string;
  display_name_ar: string;
  color: string;
}

interface ResponsiveDriversTableProps {
  drivers: Driver[];
  statusCategories: DriverStatusCategory[];
  status?: "all" | "pending" | "approved" | "rejected";
  onViewDriver: (driverId: string) => void;
}

export const ResponsiveDriversTable: React.FC<ResponsiveDriversTableProps> = ({
  drivers,
  statusCategories,
  status = "all",
  onViewDriver,
}) => {
  const { t, language } = useLanguage();

  const filteredDrivers =
    status === "all"
      ? drivers
      : drivers.filter((driver) => driver.status === status);

  const getUserTypeBadge = () => (
    <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1 text-xs">
      <Car className="h-3 w-3" />
      {t("driver")}
    </Badge>
  );

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
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("driverName")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("userType")}
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
                  {t("registrationDate")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("acceptanceDate")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("subscriptionStatus")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("subscriptionPlan")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("subscriptionAmount")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("subscriptionActivationDate")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("subscriptionExpiresDate")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("actions")}
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
                        title={getUserName(driver, t)}
                      >
                        {getUserName(driver, t)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getUserTypeBadge()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className="max-w-[180px] truncate"
                        title={driver.email || t("notAvailable")}
                      >
                        {driver.email || t("notAvailable")}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {driver.phone}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        style={getStatusBadgeStyle(driver.status || "pending", statusCategories)}
                        className="text-white border-0 whitespace-nowrap text-xs"
                      >
                        {language === "ar"
                          ? statusCategory?.display_name_ar || driver.status
                          : statusCategory?.name || driver.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap text-sm">
                      {formatDate(
                        driver.created_at || driver.profile_created_at,
                        language,
                        t
                      )}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap text-sm">
                      {(() => {
                        if (driver.status === "approved" && driver.updated_at) {
                          return formatDate(driver.updated_at, language, t);
                        }
                        if (driver.status === "rejected" && driver.updated_at) {
                          return formatDate(driver.updated_at, language, t);
                        }
                        return t("notApplicable");
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      {t(driver.subscription_status)}
                    </TableCell>
                    <TableCell className="text-center">
                      {t(driver.subscription_plan) || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatCurrency(driver.subscription_amount, t)}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {formatDate(driver.subscription_activated_at, language, t)}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {formatDate(driver.subscription_expires_at, language, t)}
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

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-4">
        {filteredDrivers.map((driver) => (
          <DriverMobileCard
            key={driver.id}
            driver={driver}
            statusCategories={statusCategories}
            onViewDriver={onViewDriver}
          />
        ))}
      </div>
    </>
  );
};
