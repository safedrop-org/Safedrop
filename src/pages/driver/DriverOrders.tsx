
import { useState } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { PhoneIcon, MapPinIcon, ClockIcon, CheckIcon, XIcon, AlertTriangleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const DriverOrdersContent = () => {
  const { t } = useLanguage();
  const [isAvailable, setIsAvailable] = useState(true);
  const { user } = useAuth();
  const { data: orders, isLoading, error } = useOrders();

  const availableOrders = orders?.filter(order => !order.driver_id) ?? [];
  const currentOrders = orders?.filter(order => 
    order.driver_id === user?.id && 
    order.status !== 'completed' && 
    order.status !== 'cancelled'
  ) ?? [];
  const orderHistory = orders?.filter(order => 
    order.driver_id === user?.id && 
    (order.status === 'completed' || order.status === 'cancelled')
  ) ?? [];

  const handleAcceptOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ driver_id: user?.id, status: 'accepted' })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`تم قبول الطلب رقم ${id} بنجاح`);
    } catch (err) {
      console.error('Error accepting order:', err);
      toast.error('حدث خطأ أثناء قبول الطلب');
    }
  };

  const handleCompleteOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed', actual_delivery_time: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`تم توصيل الطلب رقم ${id} بنجاح`);
    } catch (err) {
      console.error('Error completing order:', err);
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  const handleContactCustomer = (phone: string) => {
    toast.info(`جاري الاتصال بالعميل: ${phone}`);
  };

  const handleCancelOrder = (id: string) => {
    toast.error(`تم إلغاء الطلب رقم ${id}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">إدارة الطلبات</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">حالة الاستقبال:</span>
                <div 
                  className={`relative h-6 w-12 cursor-pointer rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-200'}`}
                  onClick={() => setIsAvailable(!isAvailable)}
                >
                  <div 
                    className={`absolute transition-transform duration-200 h-5 w-5 top-0.5 rounded-full bg-white ${isAvailable ? 'right-0.5' : 'left-0.5'}`} 
                  />
                </div>
                <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                  {isAvailable ? 'متاح' : 'غير متاح'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="current">الطلبات الحالية</TabsTrigger>
                <TabsTrigger value="available">طلبات متاحة</TabsTrigger>
                <TabsTrigger value="history">سجل الطلبات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">الطلبات الحالية</h3>
                
                {currentOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ClockIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">لا توجد طلبات حالية</p>
                      <Button 
                        variant="default" 
                        className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                      >
                        استعرض الطلبات المتاحة
                      </Button>
                    </div>
                  </div>
                ) : (
                  currentOrders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span>طلب #{order.id}</span>
                          </CardTitle>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                            {order.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">معلومات العميل:</p>
                            <p className="font-medium">{order.customer}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <PhoneIcon className="h-3 w-3" />
                              <span>{order.phone}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">وقت الطلب:</p>
                            <p className="font-medium">{order.time}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-2">
                            <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <MapPinIcon className="h-3 w-3 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">نقطة الانطلاق:</p>
                              <p>{order.pickup}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="mt-1 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                              <MapPinIcon className="h-3 w-3 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">نقطة الوصول:</p>
                              <p>{order.dropoff}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-sm text-gray-500">المبلغ:</p>
                            <p className="font-semibold text-lg">{order.price}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => handleContactCustomer(order.phone)}
                              className="flex items-center gap-1"
                            >
                              <PhoneIcon className="h-4 w-4" />
                              <span>اتصال بالعميل</span>
                            </Button>
                            <Button 
                              variant="default" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleCompleteOrder(order.id)}
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              <span>تم التوصيل</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="available" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">طلبات متاحة</h3>
                
                {!isAvailable ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangleIcon className="h-12 w-12 text-yellow-500 mb-4" />
                      <p className="text-gray-600 mb-4">أنت حالياً غير متاح لاستقبال طلبات جديدة</p>
                      <Button 
                        variant="default" 
                        className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                        onClick={() => setIsAvailable(true)}
                      >
                        تغيير الحالة إلى متاح
                      </Button>
                    </div>
                  </div>
                ) : availableOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ClockIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">لا توجد طلبات متاحة حالياً</p>
                    </div>
                  </div>
                ) : (
                  availableOrders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span>طلب #{order.id}</span>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 mr-2">
                            جديد
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-2">
                            <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <MapPinIcon className="h-3 w-3 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">نقطة الانطلاق:</p>
                              <p>{order.pickup}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="mt-1 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                              <MapPinIcon className="h-3 w-3 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">نقطة الوصول:</p>
                              <p>{order.dropoff}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                          <div className="bg-gray-50 rounded p-2">
                            <p className="text-sm text-gray-500">المسافة</p>
                            <p className="font-medium">{order.distance}</p>
                          </div>
                          <div className="bg-gray-50 rounded p-2">
                            <p className="text-sm text-gray-500">الوقت المتوقع</p>
                            <p className="font-medium">{order.time}</p>
                          </div>
                          <div className="bg-gray-50 rounded p-2">
                            <p className="text-sm text-gray-500">المبلغ</p>
                            <p className="font-medium">{order.price}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                          <Button 
                            variant="default" 
                            className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                            onClick={() => handleAcceptOrder(order.id)}
                          >
                            قبول الطلب
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">سجل الطلبات</h3>
                
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 text-xs uppercase">
                          <tr>
                            <th className="px-6 py-3 text-right font-medium text-gray-500">رقم الطلب</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500">التاريخ</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500">العميل</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500">من</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500">إلى</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500">المبلغ</th>
                            <th className="px-6 py-3 text-right font-medium text-gray-500">التقييم</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orderHistory.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{order.customer}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{order.pickup}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{order.dropoff}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{order.price}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {Array(5).fill(0).map((_, i) => (
                                  <span key={i} className={i < order.rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                                ))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
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
