
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

const CustomerOrders = () => {
  const { user } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        // Fetch active orders (pending, assigned, in_progress)
        const { data: activeData, error: activeError } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id)
          .in('status', ['pending', 'approved', 'in_transit', 'approaching']);
        
        if (activeError) throw activeError;
        
        // Fetch completed or cancelled orders
        const { data: historyData, error: historyError } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', user.id)
          .in('status', ['completed', 'cancelled']);
          
        if (historyError) throw historyError;
        
        // Fetch driver information for orders with drivers assigned
        const enrichActiveOrders = await Promise.all((activeData || []).map(async (order) => {
          if (order.driver_id) {
            const { data: driver } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', order.driver_id)
              .single();
            
            return { ...order, driver };
          }
          return order;
        }));
        
        const enrichHistoryOrders = await Promise.all((historyData || []).map(async (order) => {
          if (order.driver_id) {
            const { data: driver } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', order.driver_id)
              .single();
            
            return { ...order, driver };
          }
          return order;
        }));

        setActiveOrders(enrichActiveOrders || []);
        setHistoryOrders(enrichHistoryOrders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('حدث خطأ أثناء تحميل الطلبات');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status) => {
    const badgeClasses = {
      base: "px-2 py-1 rounded-full text-xs font-medium",
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      in_progress: "bg-indigo-100 text-indigo-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    
    const statusTranslation = {
      pending: "قيد الانتظار",
      assigned: "تم التعيين",
      in_progress: "قيد التنفيذ",
      completed: "مكتمل",
      cancelled: "ملغي"
    };

    return (
      <span className={`${badgeClasses.base} ${badgeClasses[status]}`}>
        {statusTranslation[status] || status}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">طلباتي</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="active">الطلبات النشطة</TabsTrigger>
              <TabsTrigger value="history">سجل الطلبات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">الطلبات النشطة</h3>
              <div className="overflow-x-auto">
                {activeOrders.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">من</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إلى</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السائق</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.pickup_location?.address || 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.dropoff_location?.address || 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.driver ? `${order.driver.first_name} ${order.driver.last_name}` : 'لم يتم التعيين بعد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              تفاصيل
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Clock className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                    <p>لا توجد طلبات نشطة حالياً</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">سجل الطلبات</h3>
              <div className="overflow-x-auto">
                {historyOrders.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">من</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إلى</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السائق</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {historyOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.pickup_location?.address || 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.dropoff_location?.address || 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.driver ? `${order.driver.first_name} ${order.driver.last_name}` : 'غير متوفر'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              تفاصيل
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <CheckCircle className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                    <p>لا يوجد سجل للطلبات السابقة</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default CustomerOrders;
