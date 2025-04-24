
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Truck, Clock } from 'lucide-react';

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
  driverLocation?: { lat: number; lng: number } | null;
  onStatusUpdated?: () => void;
}

const OrderStatusUpdater: React.FC<OrderStatusUpdaterProps> = ({
  orderId,
  currentStatus,
  driverLocation,
  onStatusUpdated
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateOrderStatus = async (newStatus: 'approaching' | 'in_transit') => {
    if (!driverLocation) {
      toast.error('لا يمكن تحديث الحالة بدون تحديد الموقع');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          driver_location: driverLocation 
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`تم تحديث حالة الطلب إلى ${newStatus === 'approaching' ? 'اقترب' : 'بدأ التوصيل'}`);
      if (onStatusUpdated) onStatusUpdated();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:space-x-reverse">
      <Button
        variant={currentStatus === 'approaching' ? "default" : "outline"}
        onClick={() => updateOrderStatus('approaching')}
        disabled={isUpdating || !driverLocation || currentStatus === 'completed'}
        className="gap-1"
      >
        <Clock className="h-4 w-4 ml-1" />
        اقترب
      </Button>
      
      <Button
        variant={currentStatus === 'in_transit' ? "default" : "outline"}
        onClick={() => updateOrderStatus('in_transit')}
        disabled={isUpdating || !driverLocation || currentStatus === 'completed'}
        className="gap-1"
      >
        <Truck className="h-4 w-4 ml-1" />
        بدأ التوصيل
      </Button>
    </div>
  );
};

export default OrderStatusUpdater;
