
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { LogOutIcon, SearchIcon, PackageIcon, TruckIcon, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  id: string;
  customerName: string;
  driverName: string;
  pickupLocation: string;
  deliveryLocation: string;
  price: number;
  orderDate: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'canceled';
}

const useOrders = (status?: string) => {
  return useQuery({
    queryKey: ['orders', status],
    queryFn: async () => {
      try {
        // In a real implementation, this would fetch data from Supabase
        // const query = supabase
        //   .from('orders')
        //   .select('*, customer:customer_id(first_name, last_name), driver:driver_id(first_name, last_name)')
        //   .order('created_at', { ascending: false })
        //   .limit(20);
        
        // if (status) {
        //   query.eq('status', status);
        // }
        
        // const { data, error } = await query;
        
        // if (error) throw error;
        
        // Return the processed orders
        // return data.map(order => ({
        //   id: order.id,
        //   customerName: `${order.customer.first_name} ${order.customer.last_name}`,
        //   driverName: order.driver ? `${order.driver.first_name} ${order.driver.last_name}` : 'لم يتم التعيين',
        //   pickupLocation: order.pickup_location,
        //   deliveryLocation: order.delivery_location,
        //   price: order.price,
        //   orderDate: new Date(order.created_at).toLocaleDateString('ar-SA'),
        //   status: order.status
        // }));
        
        // Return an empty array for now
        return [] as OrderItem[];
        
      } catch (error) {
        console.error('Error fetching orders:', error);
        return [] as OrderItem[];
      }
    }
  });
};

const OrdersContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  
  const { data: orders = [], isLoading } = useOrders(filterStatus);

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth || adminAuth !== 'true') {
      navigate('/admin');
    } else {
      setIsAdmin(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const handleViewDetails = (order: OrderItem) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const filteredOrders = searchQuery
    ? orders.filter(
        order =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.deliveryLocation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const activeOrders = orders.filter(
    order => ['accepted', 'picked_up', 'in_transit'].includes(order.status)
  );
  const completedOrders = orders.filter(order => order.status === 'delivered');
  const canceledOrders = orders.filter(order => order.status === 'canceled');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
      case 'accepted':
        return <Badge className="bg-blue-500">تم القبول</Badge>;
      case 'picked_up':
        return <Badge className="bg-blue-600">تم الاستلام</Badge>;
      case 'in_transit':
        return <Badge className="bg-purple-500">جاري التوصيل</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">تم التوصيل</Badge>;
      case 'canceled':
        return <Badge className="bg-red-500">ملغي</Badge>;
      default:
        return null;
    }
  };

  if (!isAdmin) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">إدارة الطلبات</h1>
            <Button variant="outline" className="gap-2" onClick={handleLogout}>
              <LogOutIcon className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative w-full sm:w-auto">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  className="pl-10 pr-4" 
                  placeholder="ابحث برقم الطلب أو اسم العميل أو السائق" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-auto">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="فلترة حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={undefined}>جميع الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="accepted">تم القبول</SelectItem>
                    <SelectItem value="picked_up">تم الاستلام</SelectItem>
                    <SelectItem value="in_transit">جاري التوصيل</SelectItem>
                    <SelectItem value="delivered">تم التوصيل</SelectItem>
                    <SelectItem value="canceled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">طلبات قيد الانتظار</p>
                      <p className="text-xl font-bold">{pendingOrders.length}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Clock className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">طلبات نشطة</p>
                      <p className="text-xl font-bold">{activeOrders.length}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <TruckIcon className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">طلبات مكتملة</p>
                      <p className="text-xl font-bold">{completedOrders.length}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">طلبات ملغاة</p>
                      <p className="text-xl font-bold">{canceledOrders.length}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <XCircle className="h-6 w-6 text-red-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-6">
                <TabsTrigger value="all">جميع الطلبات</TabsTrigger>
                <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
                <TabsTrigger value="active">نشطة</TabsTrigger>
                <TabsTrigger value="completed">مكتملة</TabsTrigger>
                <TabsTrigger value="canceled">ملغاة</TabsTrigger>
              </TabsList>
              
              {isLoading ? (
                <div className="flex justify-center items-center p-12">
                  <p>جاري تحميل البيانات...</p>
                </div>
              ) : (
                <>
                  <TabsContent value="all">
                    <OrdersTable
                      orders={filteredOrders}
                      getStatusBadge={getStatusBadge}
                      onViewDetails={handleViewDetails}
                    />
                  </TabsContent>
                  
                  <TabsContent value="pending">
                    <OrdersTable
                      orders={pendingOrders.filter(order =>
                        searchQuery
                          ? order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
                          : true
                      )}
                      getStatusBadge={getStatusBadge}
                      onViewDetails={handleViewDetails}
                    />
                  </TabsContent>
                  
                  <TabsContent value="active">
                    <OrdersTable
                      orders={activeOrders.filter(order =>
                        searchQuery
                          ? order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.driverName.toLowerCase().includes(searchQuery.toLowerCase())
                          : true
                      )}
                      getStatusBadge={getStatusBadge}
                      onViewDetails={handleViewDetails}
                    />
                  </TabsContent>
                  
                  <TabsContent value="completed">
                    <OrdersTable
                      orders={completedOrders.filter(order =>
                        searchQuery
                          ? order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.driverName.toLowerCase().includes(searchQuery.toLowerCase())
                          : true
                      )}
                      getStatusBadge={getStatusBadge}
                      onViewDetails={handleViewDetails}
                    />
                  </TabsContent>
                  
                  <TabsContent value="canceled">
                    <OrdersTable
                      orders={canceledOrders.filter(order =>
                        searchQuery
                          ? order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
                          : true
                      )}
                      getStatusBadge={getStatusBadge}
                      onViewDetails={handleViewDetails}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">العميل:</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">السائق:</p>
                  <p className="font-medium">{selectedOrder.driverName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ الطلب:</p>
                  <p className="font-medium">{selectedOrder.orderDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">حالة الطلب:</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">موقع الاستلام:</p>
                <p className="font-medium">{selectedOrder.pickupLocation}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">موقع التوصيل:</p>
                <p className="font-medium">{selectedOrder.deliveryLocation}</p>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-lg">
                  <p>المبلغ الإجمالي:</p>
                  <p className="font-bold">{selectedOrder.price} ريال</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setOrderDetailsOpen(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface OrdersTableProps {
  orders: OrderItem[];
  getStatusBadge: (status: string) => React.ReactNode;
  onViewDetails: (order: OrderItem) => void;
}

const OrdersTable = ({ orders, getStatusBadge, onViewDetails }: OrdersTableProps) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="flex flex-col items-center justify-center">
          <PackageIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">لا توجد طلبات في هذه الفئة</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-right font-medium text-gray-500">رقم الطلب</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">العميل</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">السائق</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">التاريخ</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">المبلغ</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الحالة</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.driverName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.orderDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.price} ريال</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewDetails(order)}
                    >
                      عرض التفاصيل
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

const Orders = () => {
  return (
    <LanguageProvider>
      <OrdersContent />
    </LanguageProvider>
  );
};

export default Orders;
