
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPinIcon, PhoneIcon, ClockIcon, CheckIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import OrderStatusUpdater from "./OrderStatusUpdater";

interface OrderDetailsCardProps {
  order: any;
  onOrderUpdate: () => void;
  driverLocation?: { lat: number; lng: number } | null;
  showCompleteButton?: boolean;
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({
  order,
  onOrderUpdate,
  driverLocation,
  showCompleteButton = true
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "pending": return "قيد الانتظار";
      case "approved": return "موافق عليه";
      case "in_transit": return "قيد التوصيل";
      case "approaching": return "اقترب";
      case "arrived": return "وصل";
      case "completed": return "مكتمل";
      case "cancelled": return "ملغي";
      case "five_minutes_away": return "متبقي 5 دقائق";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_transit": return "bg-purple-100 text-purple-800 border-purple-200";
      case "approaching": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "arrived": return "bg-teal-100 text-teal-800 border-teal-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "five_minutes_away": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleContactCustomer = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error("رقم الهاتف غير متاح");
    }
  };

  const handleCompleteOrder = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'completed', 
          actual_delivery_time: new Date().toISOString() 
        })
        .eq('id', order.id);
      
      if (error) throw error;
      
      toast.success('تم تسليم الطلب بنجاح');
      onOrderUpdate();
    } catch (err) {
      console.error('Error completing order:', err);
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFiveMinutesAway = async () => {
    if (!driverLocation) {
      toast.error('لا يمكن تحديث الحالة بدون تحديد الموقع');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'approved', // Always use "approved" for database consistency
          driver_location: driverLocation 
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('تم تحديث حالة الطلب إلى متبقي 5 دقائق');
      onOrderUpdate();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>طلب #{order.id}</span>
          </CardTitle>
          <Badge 
            variant="outline" 
            className={getStatusColor(order.status)}
          >
            {getStatusLabel(order.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">معلومات العميل:</p>
            <p className="font-medium">
              {order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'غير معروف'}
            </p>
            {order.customer?.phone && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <PhoneIcon className="h-3 w-3" />
                <span>{order.customer.phone}</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">وقت الطلب:</p>
            <p className="font-medium">
              {new Date(order.created_at).toLocaleString('ar-SA')}
            </p>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <MapPinIcon className="h-3 w-3 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">نقطة الانطلاق:</p>
              <p>{order.pickup_location?.formatted_address || 'غير محدد'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-1 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <MapPinIcon className="h-3 w-3 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">نقطة الوصول:</p>
              <p>{order.dropoff_location?.formatted_address || 'غير محدد'}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-500">المبلغ:</p>
            <p className="font-semibold text-lg">
              {order.price ? `${order.price} ر.س` : 'غير محدد'}
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            {order.customer?.phone && (
              <Button 
                variant="outline"
                onClick={() => handleContactCustomer(order.customer.phone)}
                className="flex items-center gap-1"
                disabled={isUpdating}
              >
                <PhoneIcon className="h-4 w-4" />
                <span>اتصال بالعميل</span>
              </Button>
            )}
            
            {showCompleteButton && order.status !== "completed" && (
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleCompleteOrder}
                disabled={isUpdating}
              >
                <CheckIcon className="h-4 w-4 ml-1" />
                <span>تم التوصيل</span>
              </Button>
            )}

            {order.status !== "completed" && (
              <Button 
                variant="outline" 
                className="text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100"
                onClick={handleFiveMinutesAway}
                disabled={isUpdating || !driverLocation}
              >
                <ClockIcon className="h-4 w-4 ml-1" />
                <span>متبقي 5 دقائق</span>
              </Button>
            )}
          </div>
        </div>

        {order.status !== "completed" && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">تحديث حالة الطلب:</p>
            <OrderStatusUpdater
              orderId={order.id}
              currentStatus={order.status}
              driverLocation={driverLocation}
              onStatusUpdated={onOrderUpdate}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderDetailsCard;
