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
import { MapPinIcon, PhoneIcon, CalendarIcon } from "lucide-react";

interface OrderDetailsProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export function OrderDetails({ order, isOpen, onClose, onStatusUpdate }: OrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAccept = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;
      
      toast.success('تم قبول الطلب بنجاح');
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('حدث خطأ أثناء قبول الطلب');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;
      
      toast.success('تم رفض الطلب بنجاح');
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('حدث خطأ أثناء رفض الطلب');
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

          {/* Order Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">تفاصيل الطلب</h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                تاريخ الإنشاء: {formatDate(order.created_at)}
              </p>
              <p className="text-gray-700">
                السعر: {order.price ? `${order.price} ر.س` : 'غير محدد'}
              </p>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-4 col-span-2">
            <h3 className="font-semibold text-lg">معلومات التوصيل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">عنوان الاستلام:</p>
                <p className="text-gray-600">{order.pickup_location?.formatted_address || 'غير محدد'}</p>
              </div>
              <div>
                <p className="font-medium">عنوان التوصيل:</p>
                <p className="text-gray-600">{order.dropoff_location?.formatted_address || 'غير محدد'}</p>
              </div>
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

        <DialogFooter className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isUpdating}
          >
            إغلاق
          </Button>
          {order.status === 'pending' && (
            <>
              <Button 
                variant="default"
                onClick={handleAccept}
                disabled={isUpdating}
              >
                قبول الطلب
              </Button>
              <Button 
                variant="destructive"
                onClick={handleReject}
                disabled={isUpdating}
              >
                رفض الطلب
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
