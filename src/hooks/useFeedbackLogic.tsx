import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useOrders } from "@/hooks/useOrders";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/components/ui/language-context";

export const useFeedbackLogic = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: orders, isLoading, error } = useOrders();
  
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingRatings, setExistingRatings] = useState<string[]>([]);

  // Fetch existing ratings to filter out already rated orders
  useEffect(() => {
    const fetchExistingRatings = async () => {
      if (!user) return;

      try {
        const { data: ratings, error } = await supabase
          .from("driver_ratings")
          .select("order_id")
          .eq("customer_id", user.id);

        if (error) {
          console.error("Error fetching existing ratings:", error);
          return;
        }

        const ratedOrderIds = ratings?.map((rating) => rating.order_id) || [];
        setExistingRatings(ratedOrderIds);
      } catch (err) {
        console.error("Error in fetchExistingRatings:", err);
      }
    };

    fetchExistingRatings();
  }, [user]);

  // Filter only completed orders that haven't been rated yet
  const unratedCompletedOrders =
    orders?.filter((order) => {
      const isCompleted = order.status === "completed";
      const hasDriver = order.driver_id;
      const notRated = !existingRatings.includes(order.id);

      return isCompleted && hasDriver && notRated;
    }) || [];

  const handleSubmit = async () => {
    if (!user || !selectedOrder || !rating) {
      toast.error(
        t("pleaseSelectOrderRating") || "Please select an order and rating"
      );
      return;
    }

    setSubmitting(true);
    try {
      const order = orders?.find((o) => o.id === selectedOrder);
      if (!order?.driver_id) {
        throw new Error("Driver ID not found");
      }

      // Check if rating already exists for this order
      const { data: existingRating, error: checkError } = await supabase
        .from("driver_ratings")
        .select("id")
        .eq("order_id", selectedOrder)
        .eq("customer_id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing rating:", checkError);
      }

      if (existingRating) {
        toast.error(
          t("alreadyRatedOrder") || "You have already rated this order"
        );
        setSubmitting(false);
        return;
      }

      // Insert new rating
      const { error } = await supabase.from("driver_ratings").insert({
        driver_id: order.driver_id,
        order_id: selectedOrder,
        rating,
        comment: comment.trim() || null,
        customer_id: user.id,
      });

      if (error) {
        console.error("Error submitting rating:", error);
        throw error;
      }

      toast.success(
        t("ratingSubmittedSuccess") || "Rating submitted successfully"
      );
      
      // Reset form
      setSelectedOrder(null);
      setRating(null);
      setComment("");

      // Update existing ratings list
      setExistingRatings((prev) => [...prev, selectedOrder]);

      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["driver_ratings"] });
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error(t("errorSubmittingRating") || "Error submitting rating");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isLoading,
    error,
    unratedCompletedOrders,
    selectedOrder,
    setSelectedOrder,
    rating,
    setRating,
    comment,
    setComment,
    submitting,
    handleSubmit,
  };
};
