import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Truck, Clock, Loader2, AlertCircle, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

import { useLanguage } from "../ui/language-context";
type OrderStatus =
  | "available"
  | "picked_up"
  | "in_transit"
  | "approaching"
  | "completed"
  | "cancelled";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
  driverLocation?: { lat: number; lng: number } | null;
  onStatusUpdated?: () => void;
  driverId?: string | null;
}

const OrderStatusUpdater: React.FC<OrderStatusUpdaterProps> = ({
  orderId,
  currentStatus,
  driverLocation,
  onStatusUpdated,
  driverId,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(
    null
  );
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useLanguage();

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    // Reset error state
    setErrorMessage(null);

    if (!driverLocation) {
      toast.error(t("status.no_location"));
      return;
    }

    if (!orderId) {
      toast.error(t("status.invalid_order_id"));
      return;
    }

    // Validate that the current user is the assigned driver
    if (!user) {
      toast.error(t("status.login_required"));
      return;
    }

    if (driverId && driverId !== user.id) {
      setErrorMessage(t("status.unauthorized_order"));
      toast.error(t("status.unauthorized_order"));
      return;
    }

    setIsUpdating(true);
    setUpdatingStatus(newStatus);

    try {
      console.log(`Updating order ${orderId} status to ${newStatus}`, {
        driverLocation,
      });

      const orderUpdate: any = {
        status: newStatus,
        driver_location: driverLocation,
        updated_at: new Date().toISOString(),
      };

      // إذا كانت هذه أول عملية التقاط، قم بتعيين السائق للطلب
      if (currentStatus === "available" && newStatus === "picked_up") {
        orderUpdate.driver_id = user.id;
      }

      const { data, error } = await supabase
        .from("orders")
        .update(orderUpdate)
        .eq("id", orderId)
        .select();

      if (error) {
        console.error("Error updating order status:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(t("status.order_update_failed"));
      }

      console.log("Order status updated successfully:", data);

      let statusMessage = "";
      switch (newStatus) {
        case "picked_up":
          statusMessage = t("status.picked_up");
          break;
        case "in_transit":
          statusMessage = t("status.in_transit");
          break;
        case "approaching":
          statusMessage = t("status.approaching");
          break;
      }

      toast.success(`${t("status.order_updated")} ${statusMessage}`);

      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (error: any) {
      console.error("Error updating order status:", error);
      setErrorMessage(error.message || t("status.order_update_failed"));
      toast.error(`${t("status.order_update_failed")}: ${error.message || ""}`);
    } finally {
      setIsUpdating(false);
      setUpdatingStatus(null);
    }
  };

  const isCompleted = currentStatus === "completed";
  const isDriverAuthorized = !driverId || driverId === user?.id;

  return (
    <div className="space-y-2">
      {errorMessage && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:space-x-reverse">
        {currentStatus === "available" && (
          <Button
            variant="outline"
            onClick={() => updateOrderStatus("picked_up")}
            disabled={
              isUpdating ||
              !driverLocation ||
              isCompleted ||
              !isDriverAuthorized
            }
            className="gap-1"
          >
            {isUpdating && updatingStatus === "picked_up" ? (
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
            ) : (
              <Package className="h-4 w-4 ml-1" />
            )}
            {t("status.picked_up")}
          </Button>
        )}

        {currentStatus === "picked_up" && (
          <Button
            variant="default"
            onClick={() => updateOrderStatus("in_transit")}
            disabled={
              isUpdating ||
              !driverLocation ||
              isCompleted ||
              !isDriverAuthorized
            }
            className="gap-1"
          >
            {isUpdating && updatingStatus === "in_transit" ? (
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
            ) : (
              <Truck className="h-4 w-4 ml-1" />
            )}

            {t("status.in_transit")}
          </Button>
        )}

        {currentStatus === "in_transit" && (
          <Button
            variant="default"
            onClick={() => updateOrderStatus("approaching")}
            disabled={
              isUpdating ||
              !driverLocation ||
              isCompleted ||
              !isDriverAuthorized
            }
            className="gap-1"
          >
            {isUpdating && updatingStatus === "approaching" ? (
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
            ) : (
              <Clock className="h-4 w-4 ml-1" />
            )}
            اقترب
          </Button>
        )}

        {currentStatus === "approaching" && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
            {t("status.approaching")}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusUpdater;
