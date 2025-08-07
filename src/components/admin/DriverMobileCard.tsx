import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  User,
  Mail,
  Calendar,
  Clock,
  Car,
} from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";
import { formatDate, formatCurrency, getUserName, getStatusBadgeStyle } from "./common/utils";

export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: string | null;
  email?: string | null;
  user_type: string;
  created_at?: string;
  updated_at?: string;
  profile_created_at?: string;
  subscription_status: string;
  subscription_plan: string;
  subscription_amount: number;
  subscription_activated_at: string;
  subscription_expires_at: string;
}

interface DriverStatusCategory {
  name: string;
  display_name_ar: string;
  color: string;
}

interface DriverMobileCardProps {
  driver: Driver;
  statusCategories: DriverStatusCategory[];
  onViewDriver: (driverId: string) => void;
}

export const DriverMobileCard: React.FC<DriverMobileCardProps> = ({ 
  driver, 
  statusCategories, 
  onViewDriver 
}) => {
  const { t, language } = useLanguage();

  const statusCategory = statusCategories.find(
    (cat) => cat.name === driver.status
  );

  const getUserTypeBadge = () => (
    <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1 text-xs">
      <Car className="h-3 w-3" />
      {t("driver")}
    </Badge>
  );

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-bold text-lg">{getUserName(driver, t)}</span>
            </div>
            <Badge
              style={getStatusBadgeStyle(driver.status || "pending", statusCategories)}
              className="text-white border-0 text-xs"
            >
              {language === "ar"
                ? statusCategory?.display_name_ar || driver.status
                : statusCategory?.name || driver.status}
            </Badge>
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{t("user")}:</span>
                <span className="font-medium">{getUserName(driver, t)}</span>
              </div>
              {getUserTypeBadge()}
            </div>

            <div className="flex items-start gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
              <span className="text-gray-600">{t("email")}:</span>
              <span className="font-medium break-all text-left">
                {driver.email || t("notAvailable")}
              </span>
            </div>
          </div>

          {/* Driver Details */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t("phoneLabel")}:</span>
              <span className="font-medium">{driver.phone}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t("userTypeLabel")}:</span>
              <span className="font-medium">{driver.user_type}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("registrationDate")}:</span>
              <span className="font-medium">
                {formatDate(driver.created_at || driver.profile_created_at, language, t)}
              </span>
            </div>

            {driver.status === "approved" && driver.updated_at && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{t("acceptanceDate")}:</span>
                <span className="font-medium">
                  {formatDate(driver.updated_at, language, t)}
                </span>
              </div>
            )}
          </div>

          {/* Subscription Details */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t("subscriptionStatus")}:</span>
              <span className="font-medium">
                {t(driver.subscription_status)}
              </span>
            </div>
            {driver.subscription_status === "active" && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {t("subscriptionPlan")}:
                  </span>
                  <span className="font-medium">
                    {t(driver.subscription_plan)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {t("subscriptionAmount")}:
                  </span>
                  <span dir="ltr" className="font-medium">
                    {formatCurrency(driver.subscription_amount, t)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    {t("subscriptionActivationDate")}:
                  </span>
                  <span className="font-medium">
                    {formatDate(driver.subscription_activated_at, language, t)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    {t("subscriptionExpiresDate")}:
                  </span>
                  <span className="font-medium">
                    {formatDate(driver.subscription_expires_at, language, t)}
                  </span>
                </div>
              </>
            )}
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
              {t("viewFullDetails")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
