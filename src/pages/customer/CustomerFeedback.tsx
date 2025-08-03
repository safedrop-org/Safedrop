import React from "react";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { useFeedbackLogic } from "@/hooks/useFeedbackLogic";
import {
  OrderSelector,
  RatingStars,
  CommentInput,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/customer/common";

const CustomerFeedbackContent = () => {
  const { t } = useLanguage();
  const {
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
  } = useFeedbackLogic();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">
          {t("Feedback & Rating") || "التقييم والملاحظات"}
        </h1>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t("Service Rating") || "تقييم الخدمة"}
          </h2>

          {unratedCompletedOrders.length > 0 ? (
            <div className="space-y-4">
              <OrderSelector
                orders={unratedCompletedOrders}
                selectedOrder={selectedOrder}
                onOrderSelect={setSelectedOrder}
              />

              <RatingStars
                rating={rating}
                onRatingChange={setRating}
              />

              <CommentInput
                comment={comment}
                onCommentChange={setComment}
              />

              <Button
                onClick={handleSubmit}
                className="w-full md:w-auto"
                disabled={submitting || !rating || !selectedOrder}
              >
                {submitting
                  ? t("Submitting...") || "جاري الإرسال..."
                  : t("Submit Rating") || "إرسال التقييم"}
              </Button>
            </div>
          ) : (
            <EmptyState
              message={
                t("No completed orders available for rating") ||
                "لا توجد طلبات مكتملة متاحة للتقييم"
              }
            />
          )}
        </Card>
      </main>
    </div>
  );
};

const CustomerFeedback = () => {
  return (
    <LanguageProvider>
      <CustomerFeedbackContent />
    </LanguageProvider>
  );
};

export default CustomerFeedback;
