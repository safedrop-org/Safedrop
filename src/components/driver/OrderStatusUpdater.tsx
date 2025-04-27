
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Truck, Clock, Loader2 } from 'lucide-react';

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
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Check if status is valid based on the database constraint
  const updateOrderStatus = async (newStatus: 'in_transit' | 'approved') => {
    if (!driverLocation) {
      toast.error('لا يمكن تحديث الحالة بدون تحديد الموقع');
      return;
    }

    if (!orderId) {
      toast.error('معرف الطلب غير صالح');
      return;
    }

    setIsUpdating(true);
    setUpdatingStatus(newStatus);
    
    try {
      console.log(`Updating order ${orderId} status to ${newStatus}`, { driverLocation });

      // Verify the order exists
      const { data: orderExists, error: checkError } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking if order exists:", checkError);
        throw checkError;
      }
      
      if (!orderExists) {
        throw new Error('الطلب غير موجود');
      }

      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          driver_location: driverLocation,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }
      
      console.log('Order status updated successfully:', data);
      
      toast.success(`تم تحديث حالة الطلب إلى ${newStatus === 'approved' ? 'اقترب' : 'بدأ التوصيل'}`);
      
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(`حدث خطأ أثناء تحديث حالة الطلب: ${error.message || ''}`);
    } finally {
      setIsUpdating(false);
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:space-x-reverse">
      <Button
        variant={currentStatus === 'approved' ? "default" : "outline"}
        onClick={() => updateOrderStatus('approved')}
        disabled={isUpdating || !driverLocation || currentStatus === 'completed'}
        className="gap-1"
      >
        {isUpdating && updatingStatus === 'approved' ? (
          <Loader2 className="h-4 w-4 ml-1 animate-spin" />
        ) : (
          <Clock className="h-4 w-4 ml-1" />
        )}
        اقترب
      </Button>
      
      <Button
        variant={currentStatus === 'in_transit' ? "default" : "outline"}
        onClick={() => updateOrderStatus('in_transit')}
        disabled={isUpdating || !driverLocation || currentStatus === 'completed'}
        className="gap-1"
      >
        {isUpdating && updatingStatus === 'in_transit' ? (
          <Loader2 className="h-4 w-4 ml-1 animate-spin" />
        ) : (
          <Truck className="h-4 w-4 ml-1" />
        )}
        بدأ التوصيل
      </Button>
    </div>
  );
};

export default OrderStatusUpdater;
