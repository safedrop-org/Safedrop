
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderDetailsProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export function OrderDetails({ order, isOpen, onClose, onStatusUpdate }: OrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);

  const handleStatusChange = async (newStatus: string) => {
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
      <DialogContent className="max-w-3xl">
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
              <Select onValueChange={setSelectedStatus} defaultValue={order.status}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر حالة الطلب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الإنتظار</SelectItem>
                  <SelectItem value="approved">مقبول</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="in_transit">قيد التوصيل</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => handleStatusChange(selectedStatus)}
                disabled={isUpdating || selectedStatus === order.status}
                className="w-full mt-2"
              >
                تحديث الحالة
              </Button>
            </div>
          </div>

          {/* Pickup Details */}
          <div className="space-y-4 col-span-2">
            <h3 className="font-semibold text-lg">معلومات الاستلام</h3>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">العنوان:</p>
              <p className="text-gray-600">{order.pickup_location?.address || 'غير محدد'}</p>
              <p className="font-medium mt-2">تفاصيل إضافية:</p>
              <p className="text-gray-600">{order.pickup_location?.details || 'لا توجد تفاصيل إضافية'}</p>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="space-y-4 col-span-2">
            <h3 className="font-semibold text-lg">معلومات التوصيل</h3>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">العنوان:</p>
              <p className="text-gray-600">{order.dropoff_location?.address || 'غير محدد'}</p>
              <p className="font-medium mt-2">تفاصيل إضافية:</p>
              <p className="text-gray-600">{order.dropoff_location?.details || 'لا توجد تفاصيل إضافية'}</p>
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
