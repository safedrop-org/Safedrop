
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

interface OrderDetailsProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export function OrderDetails({ order, isOpen, onClose, onStatusUpdate }: OrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;
      
      toast.success('تم تحديث حالة الطلب بنجاح');
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">تفاصيل الطلب #{order.id.substring(0, 8)}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">معلومات العميل</h3>
            {order.customer && (
              <div className="space-y-2">
                <p className="text-gray-700">
                  الاسم: {order.customer.first_name} {order.customer.last_name}
                </p>
                <p className="text-gray-700">
                  الهاتف: {order.customer.phone || 'غير متوفر'}
                </p>
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
                  order.status === "completed" ? "bg-green-100 text-green-800 border-green-200" :
                  order.status === "approved" ? "bg-blue-100 text-blue-800 border-blue-200" :
                  order.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                  order.status === "rejected" ? "bg-red-100 text-red-800 border-red-200" :
                  "bg-gray-100 text-gray-800 border-gray-200"
                }
              >
                {order.status === "completed" ? "مكتمل" :
                 order.status === "approved" ? "موافق عليه" :
                 order.status === "pending" ? "قيد الانتظار" :
                 order.status === "rejected" ? "مرفوض" :
                 order.status}
              </Badge>
              
              {order.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => handleStatusChange('approved')}
                    disabled={isUpdating}
                    variant="default"
                  >
                    قبول الطلب
                  </Button>
                  <Button 
                    onClick={() => handleStatusChange('rejected')}
                    disabled={isUpdating}
                    variant="destructive"
                  >
                    رفض الطلب
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
              <p className="text-gray-600">{order.pickup_location?.formatted_address || 'غير محدد'}</p>
              <p className="font-medium mt-2">تفاصيل إضافية:</p>
              <p className="text-gray-600">{order.pickup_location?.additional_details || 'لا توجد تفاصيل إضافية'}</p>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="space-y-4 col-span-2">
            <h3 className="font-semibold text-lg">معلومات التوصيل</h3>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">العنوان:</p>
              <p className="text-gray-600">{order.dropoff_location?.formatted_address || 'غير محدد'}</p>
              <p className="font-medium mt-2">تفاصيل إضافية:</p>
              <p className="text-gray-600">{order.dropoff_location?.additional_details || 'لا توجد تفاصيل إضافية'}</p>
            </div>
          </div>

          {/* Package Details */}
          <div className="col-span-2">
            <h3 className="font-semibold text-lg mb-2">تفاصيل الشحنة</h3>
            <p className="text-gray-600">{order.package_details || 'لا توجد تفاصيل'}</p>
          </div>

          {/* Driver Notes */}
          <div className="col-span-2">
            <h3 className="font-semibold text-lg mb-2">ملاحظات للسائق</h3>
            <p className="text-gray-600">{order.notes || 'لا توجد ملاحظات'}</p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isUpdating}
          >
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
