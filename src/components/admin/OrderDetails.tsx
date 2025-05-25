import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Info } from "lucide-react";

interface OrderDetailsProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export function OrderDetails({
  order,
  isOpen,
  onClose,
  onStatusUpdate,
}: OrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: "approved" | "rejected") => {
    setIsUpdating(true);
    try {
      // Check if order is valid and has an ID
      if (!order?.id) {
        throw new Error("معرف الطلب غير صالح");
      }

      // First, check if the order exists
      const { data: existingOrder, error: checkError } = await supabase
        .from("orders")
        .select("id")
        .eq("id", order.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking order existence:", checkError);
        throw checkError;
      }

      if (!existingOrder) {
        throw new Error("الطلب غير موجود");
      }

      const { data, error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .select();

      if (error) {
        console.error("Error updating order status:", error);
        throw error;
      }

      toast.success("تم تحديث حالة الطلب بنجاح");
      onStatusUpdate(); // تحديث قائمة الطلبات
      onClose(); // إغلاق النافذة
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error(`حدث خطأ أثناء تحديث حالة الطلب: ${error.message || ""}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "غير متوفر";

    return new Date(dateString).toLocaleString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // تحقق من وجود بيانات الطلب
  const isOrderValid = Boolean(order && order.id);

  if (!isOrderValid) return null;

  // استخراج بيانات المواقع بشكل آمن
  const pickupAddress =
    order?.pickup_location?.formatted_address ||
    order?.pickup_location?.address ||
    "غير محدد";
  const pickupDetails =
    order?.pickup_location?.additional_details || "لا توجد تفاصيل إضافية";
  const dropoffAddress =
    order?.dropoff_location?.formatted_address ||
    order?.dropoff_location?.address ||
    "غير محدد";
  const dropoffDetails =
    order?.dropoff_location?.additional_details || "لا توجد تفاصيل إضافية";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-left">
            تفاصيل الطلب #{order.order_number?.substring(0, 8) || "غير معروف"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">معلومات العميل</h3>
            {order.customer ? (
              <div className="space-y-2">
                <p className="text-gray-700">
                  الاسم: {order.customer.first_name} {order.customer.last_name}
                </p>
                <p className="text-gray-700">
                  الهاتف: {order.customer.phone || "غير متوفر"}
                </p>
              </div>
            ) : (
              <div className="flex items-center text-amber-600 bg-amber-50 p-2 rounded-md">
                <Info className="h-4 w-4 mr-2" />
                <span>معلومات العميل غير متوفرة</span>
              </div>
            )}
          </div>

          {/* Order Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">حالة الطلب</h3>
            <div className="space-y-2">
              <Badge
                variant="outline"
                className={
                  order.status === "completed"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : order.status === "approved"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : order.status === "pending"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : order.status === "rejected"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : "bg-gray-100 text-gray-800 border-gray-200"
                }
              >
                {order.status === "completed"
                  ? "مكتمل"
                  : order.status === "approved"
                  ? "موافق عليه"
                  : order.status === "pending"
                  ? "قيد الانتظار"
                  : order.status === "rejected"
                  ? "مرفوض"
                  : order.status}
              </Badge>

              {order.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleStatusChange("approved")}
                    disabled={isUpdating}
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? "جاري المعالجة..." : "قبول الطلب"}
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("rejected")}
                    disabled={isUpdating}
                    variant="destructive"
                  >
                    {isUpdating ? "جاري المعالجة..." : "رفض الطلب"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Pickup Details */}
          <div className="space-y-4 col-span-2">
            <h3 className="font-semibold text-lg">معلومات الاستلام</h3>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">العنوان:</p>
              <p className="text-gray-600">{pickupAddress}</p>
              <p className="font-medium mt-2">تفاصيل إضافية:</p>
              <p className="text-gray-600">{pickupDetails}</p>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="space-y-4 col-span-2">
            <h3 className="font-semibold text-lg">معلومات التوصيل</h3>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">العنوان:</p>
              <p className="text-gray-600">{dropoffAddress}</p>
              <p className="font-medium mt-2">تفاصيل إضافية:</p>
              <p className="text-gray-600">{dropoffDetails}</p>
            </div>
          </div>

          {/* Package Details */}
          <div className="col-span-2">
            <h3 className="font-semibold text-lg mb-2">تفاصيل الشحنة</h3>
            <p className="text-gray-600">
              {order.package_details || "لا توجد تفاصيل"}
            </p>
          </div>

          {/* Driver Notes */}
          <div className="col-span-2">
            <h3 className="font-semibold text-lg mb-2">ملاحظات للسائق</h3>
            <p className="text-gray-600">{order.notes || "لا توجد ملاحظات"}</p>
          </div>

          {/* Payment Information */}
          <div className="col-span-2">
            <h3 className="font-semibold text-lg mb-2">معلومات الدفع</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500 mb-1">المبلغ:</p>
                <p className="font-medium">
                  {order.price ? `${order.price} ر.س` : "غير محدد"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500 mb-1">طريقة الدفع:</p>
                <p className="font-medium">
                  {order.payment_method || "غير محدد"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500 mb-1">حالة الدفع:</p>
                <Badge
                  variant="outline"
                  className={
                    order.payment_status === "paid"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : order.payment_status === "pending"
                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : "bg-gray-100 text-gray-800 border-gray-200"
                  }
                >
                  {order.payment_status === "paid"
                    ? "مدفوع"
                    : order.payment_status === "pending"
                    ? "غير مدفوع"
                    : order.payment_status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
