import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Truck, Clock, Loader2, AlertCircle, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type OrderStatus = 'available' | 'picked_up' | 'in_transit' | 'approaching' | 'completed' | 'cancelled';

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
  driverId
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(null);
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    // Reset error state
    setErrorMessage(null);
    
    if (!driverLocation) {
      toast.error('لا يمكن تحديث الحالة بدون تحديد الموقع');
      return;
    }

    if (!orderId) {
      toast.error('معرف الطلب غير صالح');
      return;
    }
    
    // Validate that the current user is the assigned driver
    if (!user) {
      toast.error('يجب تسجيل الدخول لتحديث حالة الطلب');
      return;
    }
    
    if (driverId && driverId !== user.id) {
      setErrorMessage('لا يمكنك تعديل طلب غير مسند إليك');
      toast.error('لا يمكنك تعديل طلب غير مسند إليك');
      return;
    }

    setIsUpdating(true);
    setUpdatingStatus(newStatus);
    
    try {
      console.log(`Updating order ${orderId} status to ${newStatus}`, { driverLocation });

      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          driver_location: driverLocation,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('driver_id', user.id)
        .select();

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('فشل تحديث حالة الطلب - تأكد من صلاحيتك');
      }
      
      console.log('Order status updated successfully:', data);
      
      let statusMessage = '';
      switch (newStatus) {
        case 'picked_up':
          statusMessage = 'ملتقط';
          break;
        case 'in_transit':
          statusMessage = 'تم إستلام الشحنة وجاري توصيلها';
          break;
        case 'approaching':
          statusMessage = 'اقترب';
          break;
      }
      
      toast.success(`تم تحديث حالة الطلب إلى ${statusMessage}`);
      
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      setErrorMessage(error.message || 'حدث خطأ أثناء تحديث حالة الطلب');
      toast.error(`حدث خطأ أثناء تحديث حالة الطلب: ${error.message || ''}`);
    } finally {
      setIsUpdating(false);
      setUpdatingStatus(null);
    }
  };

  const isCompleted = currentStatus === 'completed';
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
        {(currentStatus === 'available' || currentStatus === 'picked_up') && (
          <Button
            variant={currentStatus === 'picked_up' ? "default" : "outline"}
            onClick={() => updateOrderStatus('picked_up')}
            disabled={isUpdating || !driverLocation || isCompleted || !isDriverAuthorized}
            className="gap-1"
          >
            {isUpdating && updatingStatus === 'picked_up' ? (
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
            ) : (
              <Package className="h-4 w-4 ml-1" />
            )}
            ملتقط
          </Button>
        )}
        
        {(currentStatus === 'picked_up' || currentStatus === 'in_transit') && (
          <Button
            variant={currentStatus === 'in_transit' ? "default" : "outline"}
            onClick={() => updateOrderStatus('in_transit')}
            disabled={isUpdating || !driverLocation || isCompleted || !isDriverAuthorized}
            className="gap-1"
          >
            {isUpdating && updatingStatus === 'in_transit' ? (
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
            ) : (
              <Truck className="h-4 w-4 ml-1" />
            )}
            تم إستلام الشحنة وجاري توصيلها
          </Button>
        )}
        
        {(currentStatus === 'in_transit' || currentStatus === 'approaching') && (
          <Button
            variant={currentStatus === 'approaching' ? "default" : "outline"}
            onClick={() => updateOrderStatus('approaching')}
            disabled={isUpdating || !driverLocation || isCompleted || !isDriverAuthorized}
            className="gap-1"
          >
            {isUpdating && updatingStatus === 'approaching' ? (
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
            ) : (
              <Clock className="h-4 w-4 ml-1" />
            )}
            اقترب
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderStatusUpdater;
