
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Truck, Clock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
  driverLocation?: { lat: number; lng: number } | null;
  onStatusUpdated?: () => void;
  driverId?: string | null; // Added to validate ownership
}

const OrderStatusUpdater: React.FC<OrderStatusUpdaterProps> = ({
  orderId,
  currentStatus,
  driverLocation,
  onStatusUpdated,
  driverId
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateOrderStatus = async (newStatus: 'in_transit' | 'approaching') => {
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

      // First verify the order exists and belongs to this driver
      const { data: orderExists, error: checkError } = await supabase
        .from('orders')
        .select('id, driver_id')
        .eq('id', orderId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking if order exists:", checkError);
        throw checkError;
      }
      
      if (!orderExists) {
        throw new Error('الطلب غير موجود');
      }
      
      // Verify the driver is authorized
      if (orderExists.driver_id !== user.id) {
        throw new Error('لا يمكنك تعديل طلب غير مسند إليك');
      }

      // Only use database-allowed values: 'pending', 'approved', 'in_transit', 'completed', 'cancelled'
      // 'approaching' in UI maps to 'approved' in database
      const dbStatus = newStatus === 'approaching' ? 'approved' : 'in_transit';
      
      console.log("Setting database status to:", dbStatus);
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: dbStatus,
          driver_location: driverLocation,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('driver_id', user.id) // Extra safety: ensure we only update if driver_id matches
        .select();

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('فشل تحديث حالة الطلب - تأكد من صلاحيتك');
      }
      
      console.log('Order status updated successfully:', data);
      
      toast.success(`تم تحديث حالة الطلب إلى ${newStatus === 'approaching' ? 'اقترب' : 'بدأ التوصيل'}`);
      
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

  return (
    <div className="space-y-2">
      {errorMessage && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:space-x-reverse">
        <Button
          variant={currentStatus === 'approved' ? "default" : "outline"}
          onClick={() => updateOrderStatus('approaching')}
          disabled={isUpdating || !driverLocation || currentStatus === 'completed'}
          className="gap-1"
        >
          {isUpdating && updatingStatus === 'approaching' ? (
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
    </div>
  );
};

export default OrderStatusUpdater;
