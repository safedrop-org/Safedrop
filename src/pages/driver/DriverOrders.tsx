
import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { ClockIcon, AlertTriangleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import OrderDetailsCard from '@/components/driver/OrderDetailsCard';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const DriverOrdersContent = () => {
  const { t } = useLanguage();
  const [isAvailable, setIsAvailable] = useState(true);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading, error, refetch } = useOrders();
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeTab, setActiveTab] = useState('current');
  const [lastAcceptedOrderId, setLastAcceptedOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setDriverLocation({ lat: latitude, lng: longitude });
          },
          (error) => {
            console.error("Error getting location:", error);
            toast.error("تعذر الوصول إلى موقعك. يرجى التحقق من إعدادات الموقع.");
          }
        );
      } else {
        toast.error("متصفحك لا يدعم تحديد الموقع الجغرافي");
      }
    };

    getLocation();
    const locationInterval = setInterval(getLocation, 30000); // Update every 30 seconds

    return () => clearInterval(locationInterval);
  }, []);

  useEffect(() => {
    if (user?.id) {
      const updateDriverAvailability = async () => {
        try {
          await supabase
            .from('drivers')
            .update({ is_available: isAvailable, location: driverLocation })
            .eq('id', user.id);
        } catch (err) {
          console.error('Error updating driver availability:', err);
        }
      };

      updateDriverAvailability();
    }
  }, [isAvailable, driverLocation, user?.id]);

  useEffect(() => {
    if (orders && orders.length > 0) {
      console.log("Orders loaded:", orders.length, "orders");
      console.log("First order:", orders[0]);
    }
  }, [orders]);

  const availableOrders = orders?.filter(order => 
    !order.driver_id && order.status === 'available'
  ) ?? [];
  
  const currentOrders = orders?.filter(order => 
    order.driver_id === user?.id && 
    ['picked_up', 'in_transit', 'approaching'].includes(order.status)
  ) ?? [];
  
  const completedOrders = orders?.filter(order => 
    order.driver_id === user?.id && 
    order.status === 'completed'
  ) ?? [];

  console.log("Available orders:", availableOrders.length);
  console.log("Current orders:", currentOrders.length);
  console.log("Completed orders:", completedOrders.length);

  useEffect(() => {
    if (currentOrders.length > 0) {
      setActiveTab('current');
      setLastAcceptedOrderId(null);
    }
  }, [currentOrders.length]);

  const handleAcceptOrder = async (id: string) => {
    try {
      if (isProcessing) {
        return;
      }
      
      setIsProcessing(true);
      
      if (!driverLocation) {
        toast.error("يجب تحديد موقعك الحالي لقبول الطلب");
        setIsProcessing(false);
        return;
      }
      
      if (!user?.id) {
        toast.error("يجب تسجيل الدخول لقبول الطلب");
        setIsProcessing(false);
        return;
      }
      
      console.log("Accepting order:", id, "with driver:", user.id);

      const { data: orderCheck, error: checkError } = await supabase
        .from('orders')
        .select('id, status, driver_id')
        .eq('id', id)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking order status:", checkError);
        toast.error('حدث خطأ أثناء التحقق من حالة الطلب');
        setIsProcessing(false);
        return;
      }
        
      if (!orderCheck) {
        console.error("Order not found in database");
        toast.error('لم يتم العثور على الطلب');
        setIsProcessing(false);
        return;
      }
        
      if (orderCheck.status !== 'available' || orderCheck.driver_id) {
        console.error("Order is no longer available for acceptance", orderCheck);
        toast.error('هذا الطلب لم يعد متاحاً للقبول');
        setIsProcessing(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          driver_id: user.id, 
          status: 'picked_up',
          driver_location: driverLocation
        })
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Error accepting order:", error);
        toast.error('حدث خطأ أثناء قبول الطلب');
        setIsProcessing(false);
        return;
      }
      
      console.log("Order update response:", data);
      
      if (!data || data.length === 0) {
        console.error("No data returned from update operation");
        toast.error('حدث خطأ أثناء قبول الطلب - لم يتم العثور على الطلب');
        setIsProcessing(false);
        return;
      }
      
      toast.success(`تم قبول الطلب رقم ${id.substring(0, 8)} بنجاح`);
      setLastAcceptedOrderId(id);
      
      queryClient.invalidateQueries({queryKey: ['orders']});
      await refetch();
      
      setActiveTab('current');
    } catch (err) {
      console.error('Error accepting order:', err);
      toast.error('حدث خطأ أثناء قبول الطلب');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">{t('manageOrders')}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">{t('availabilityStatus')}:</span>
                <div 
                  className={`relative h-6 w-12 cursor-pointer rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-200'}`}
                  onClick={() => setIsAvailable(!isAvailable)}
                >
                  <div 
                    className={`absolute transition-transform duration-200 h-5 w-5 top-0.5 rounded-full bg-white ${isAvailable ? 'right-0.5' : 'left-0.5'}`} 
                  />
                </div>
                <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                  {isAvailable ? t('availableForOrders') : t('notAvailableForOrders')}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="current">{t('currentOrdersTab')}</TabsTrigger>
                <TabsTrigger value="available">{t('availableOrdersTab')}</TabsTrigger>
                <TabsTrigger value="completed">{t('completedOrdersTab')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">{t('currentOrdersTab')}</h3>
                {currentOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ClockIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">{t('noCurrentOrders')}</p>
                      <Button 
                        variant="default" 
                        className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                        onClick={() => setActiveTab('available')}
                      >
                        {t('browseAvailableOrders')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  currentOrders.map((order) => (
                    <OrderDetailsCard 
                      key={order.id}
                      order={order}
                      onOrderUpdate={refetch}
                      driverLocation={driverLocation}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="available" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">{t('availableOrdersTab')}</h3>
                {!isAvailable ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangleIcon className="h-12 w-12 text-yellow-500 mb-4" />
                      <p className="text-gray-600 mb-4">{t('notAvailableMessage')}</p>
                      <Button 
                        variant="default" 
                        className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                        onClick={() => setIsAvailable(true)}
                      >
                        {t('changeToAvailable')}
                      </Button>
                    </div>
                  </div>
                ) : availableOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ClockIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">{t('noAvailableOrders')}</p>
                    </div>
                  </div>
                ) : (
                  availableOrders.map((order) => (
                    <OrderDetailsCard 
                      key={order.id}
                      order={order}
                      onOrderUpdate={refetch}
                      driverLocation={driverLocation}
                      showAcceptButton={true}
                      onAcceptOrder={handleAcceptOrder}
                    />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">{t('completedOrdersTab')}</h3>
                {completedOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ClockIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">{t('noCompletedOrders')}</p>
                    </div>
                  </div>
                ) : (
                  completedOrders.map((order) => (
                    <OrderDetailsCard 
                      key={order.id}
                      order={order}
                      onOrderUpdate={refetch}
                      driverLocation={driverLocation}
                      showCompleteButton={false}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverOrders = () => {
  return (
    <LanguageProvider>
      <DriverOrdersContent />
    </LanguageProvider>
  );
};

export default DriverOrders;
