import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import { toast } from "sonner";

interface Driver {
  first_name: string;
  last_name: string;
  phone: string;
}

interface Order {
  id: string;
  order_id: string;
  order_number?: string;
  created_at: string;
  pickup_location?: {
    address: string;
  };
  dropoff_location?: {
    address: string;
  };
  driver_id?: string;
  driver?: Driver;
  driver_location?: {
    lat: number;
    lng: number;
  };
  status: string;
  customer_id: string;
}

export const useCustomerOrders = (language: string) => {
  const { user } = useAuth();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch active orders
      const { data: activeData, error: activeError } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .in("status", ["available", "picked_up", "in_transit", "approaching"])
        .order("created_at", { ascending: false });

      if (activeError) throw activeError;

      // Fetch completed or cancelled orders
      const { data: historyData, error: historyError } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .in("status", ["completed", "cancelled"])
        .order("created_at", { ascending: false });

      if (historyError) throw historyError;

      // Enrich orders with driver information
      const enrichOrders = async (orders: Order[]) => {
        return Promise.all(
          (orders || []).map(async (order) => {
            if (order.driver_id) {
              const { data: driver } = await supabase
                .from("profiles")
                .select("first_name, last_name, phone")
                .eq("id", order.driver_id)
                .single();

              return { ...order, driver };
            }
            return order;
          })
        );
      };

      const enrichedActiveOrders = await enrichOrders(activeData || []);
      const enrichedHistoryOrders = await enrichOrders(historyData || []);

      setActiveOrders(enrichedActiveOrders);
      setHistoryOrders(enrichedHistoryOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء تحميل الطلبات"
          : "Error loading orders"
      );
    } finally {
      setLoading(false);
    }
  };

  const completeOrder = async (orderId: string) => {
    try {
      setLoading(true);

      // Update order status to completed
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", orderId);

      if (orderError) throw orderError;

      // Create payment statistics
      const { error: statsError } = await supabase
        .from("order_payment_stats")
        .insert({
          order_id: orderId,
          driver_percentage: 75.0,
          platform_percentage: 15.0,
          customer_percentage: 10.0,
        });

      if (statsError) throw statsError;

      toast.success(
        language === "ar"
          ? "تم تأكيد استلام الطلب بنجاح"
          : "Order delivery confirmed successfully"
      );

      // Refresh orders
      await fetchOrders();
    } catch (error) {
      console.error("Error completing order:", error);
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء تأكيد استلام الطلب"
          : "Error confirming order delivery"
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      setLoading(true);

      // Update order status to cancelled
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (orderError) throw orderError;

      toast.success(
        language === "ar" ? "تم إلغاء الطلب بنجاح" : "Order cancelled successfully"
      );

      // Refresh orders
      await fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء إلغاء الطلب"
          : "Error cancelling order"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, language]);

  return {
    activeOrders,
    historyOrders,
    loading,
    completeOrder,
    cancelOrder,
    refetchOrders: fetchOrders,
  };
};
