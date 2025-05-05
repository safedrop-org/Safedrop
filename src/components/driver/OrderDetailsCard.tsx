
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPinIcon, PhoneIcon, ClockIcon, CheckIcon, Loader2Icon, Package, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import OrderStatusUpdater from "./OrderStatusUpdater";
import { useAuth } from "@/hooks/useAuth";

interface OrderDetailsCardProps {
  order: any;
  onOrderUpdate: () => void;
  driverLocation?: { lat: number; lng: number } | null;
  showCompleteButton?: boolean;
  showAcceptButton?: boolean;
  onAcceptOrder?: (orderId: string) => Promise<void>;
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({
  order,
  onOrderUpdate,
  driverLocation,
  showCompleteButton = true,
  showAcceptButton = false,
  onAcceptOrder
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const { user } = useAuth();

  const [distance, setDistance] = useState('-');
  const [duration, setDuration] = useState('-');

  useEffect(() => {
    if (!driverLocation) return;
    if (order.status !== "available") return;

    const origin = `${driverLocation.lat},${driverLocation.lng}`;
    const destination = order.pickup_location.address;
    
    fetch(`https://maps.googleapis.com/directions/json?origin=${encodeURIComponent(origin)}
    &destination=${encodeURIComponent(destination)}
    &mode=driving&key=AIzaSyCv_hgUtyxSMajB8lOjEV1Hj8vRYYRb9Rk`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "OK") {
          setDistance(res.routes[0].legs[0].distance.text);
          setDuration(res.routes[0].legs[0].duration.text);
        }
      })
      .catch((error) => console.log("error", error));
  }, [driverLocation]);

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "available": return "متاح";
      case "picked_up": return "ملتقط";
      case "in_transit": return "تم إستلام الشحنة وجاري توصيلها";
      case "approaching": return "اقترب";
      case "completed": return "مكتمل";
      case "cancelled": return "ملغي";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "available": return "bg-blue-100 text-blue-800 border-blue-200";
      case "picked_up": return "bg-purple-100 text-purple-800 border-purple-200";
      case "in_transit": return "bg-amber-100 text-amber-800 border-amber-200";
      case "approaching": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "available": return null;
      case "picked_up": return <Package className="h-3 w-3 mr-1" />;
      case "in_transit": return <Truck className="h-3 w-3 mr-1" />;
      case "approaching": return <MapPinIcon className="h-3 w-3 mr-1" />;
      case "completed": return <CheckIcon className="h-3 w-3 mr-1" />;
      default: return null;
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
    if (!user || (order.driver_id && order.driver_id !== user.id)) {
      toast.error('لا يمكنك تعديل طلب غير مسند إليك');
      return;
    }

    setIsUpdating(true);
    try {
      console.log("Setting order status to completed");
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'completed', 
          actual_delivery_time: new Date().toISOString() 
        })
        .eq('id', order.id)
        .eq('driver_id', user.id)
        .select();
      
      if (error) {
        console.error("Error completing order:", error);
        toast.error('حدث خطأ أثناء تحديث حالة الطلب');
        return;
      }
      
      if (!data || data.length === 0) {
        console.error("No data returned from update operation");
        toast.error('حدث خطأ أثناء تحديث حالة الطلب - لم يتم العثور على الطلب أو ليس لديك صلاحية');
        return;
      }
      
      toast.success('تم تسليم الطلب بنجاح');
      onOrderUpdate();
    } catch (err) {
      console.error('Error completing order:', err);
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAcceptClick = async (orderId: string) => {
    if (!onAcceptOrder) return;
    
    setIsAccepting(true);
    try {
      await onAcceptOrder(orderId);
    } finally {
      setIsAccepting(false);
    }
  };

  const getLocationAddress = (location: any) => {
    if (!location) return "غير محدد";
    
    if (location.address) return location.address;
    if (location.formatted_address) return location.formatted_address;
    if (typeof location === 'string') return location;
    
    if (typeof location === 'object') {
      if (location.name) return location.name;
      if (location.description) return location.description;
    }
    
    return "غير محدد";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>طلب #{order.id.substring(0, 8)}</span>
          </CardTitle>
          <Badge 
            variant="outline" 
            className={getStatusColor(order.status)}
          >
            {getStatusIcon(order.status)}
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
              <p>{getLocationAddress(order.pickup_location)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-1 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <MapPinIcon className="h-3 w-3 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">نقطة الوصول:</p>
              <p>{getLocationAddress(order.dropoff_location)}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div className="bg-gray-50 rounded p-2">
            <p className="text-sm text-gray-500">المسافة</p>
            <p className="font-medium">{distance}</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-sm text-gray-500">الوقت المتوقع</p>
            <p className="font-medium">{duration}</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-sm text-gray-500">المبلغ</p>
            <p className="font-medium">{order.price ? `${order.price} ر.س` : 'غير محدد'}</p>
          </div>
        </div>
        
        {order.package_details && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">تفاصيل الشحنة:</p>
            <p className="bg-gray-50 p-2 rounded">{order.package_details}</p>
          </div>
        )}
        
        {order.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">ملاحظات:</p>
            <p className="bg-gray-50 p-2 rounded">{order.notes}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-500">المبلغ:</p>
            <p className="font-semibold text-lg">
              {order.price ? `${order.price} ر.س` : 'غير محدد'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {order.customer?.phone && (
              <Button 
                variant="outline"
                onClick={() => handleContactCustomer(order.customer.phone)}
                className="flex items-center gap-1"
                disabled={isUpdating || isAccepting}
              >
                <PhoneIcon className="h-4 w-4" />
                <span>اتصال بالعميل</span>
              </Button>
            )}
            
            {showAcceptButton && onAcceptOrder && order.status === 'available' && (
              <Button 
                variant="default" 
                className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                onClick={() => handleAcceptClick(order.id)}
                disabled={isUpdating || isAccepting}
              >
                {isAccepting ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin mr-1" />
                    <span>جاري الالتقاط...</span>
                  </>
                ) : (
                  <span>التقاط الطلب</span>
                )}
              </Button>
            )}
          </div>
        </div>

        {order.status !== "completed" && order.driver_id && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">تحديث حالة الطلب:</p>
            <OrderStatusUpdater
              orderId={order.id}
              currentStatus={order.status}
              driverLocation={driverLocation}
              onStatusUpdated={onOrderUpdate}
              driverId={order.driver_id}
            />
            
            {/* Adding a status message when the order is in "approaching" status */}
            {order.status === 'approaching' && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-md text-amber-700 text-center">
                <ClockIcon className="h-5 w-5 mx-auto mb-1" />
                <p className="font-medium">بانتظار تأكيد العميل للإستلام</p>
                <p className="text-sm mt-1">سيتم إكمال الطلب عندما يقوم العميل بتأكيد الإستلام</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderDetailsCard;
