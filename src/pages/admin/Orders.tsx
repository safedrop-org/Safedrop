
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminSidebar from '@/components/admin/AdminSidebar';
import { LogOutIcon, SearchIcon, AlertCircle, PackageIcon, MapPin, Clock, Calendar, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  trackingNumber: string;
  createdAt: string;
  deliveryDate: string | null;
  status: 'pending' | 'inProgress' | 'delivered' | 'cancelled';
  price: number;
  commissionRate: number;
  customerName: string;
  driverName: string | null;
  pickupLocation: string;
  deliveryLocation: string;
  packageDetails: string;
  contactNumber: string;
}

const OrdersContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch orders data - in a real app, this would be from an API
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      const mockOrders: Order[] = [
        {
          id: '1',
          trackingNumber: 'SD-20250416-001',
          createdAt: '2025-04-16 10:30',
          deliveryDate: '2025-04-16 14:15',
          status: 'delivered',
          price: 120,
          commissionRate: 0.15,
          customerName: 'أحمد محمد',
          driverName: 'خالد العمري',
          pickupLocation: 'شارع الملك فهد، الرياض',
          deliveryLocation: 'حي النرجس، الرياض',
          packageDetails: 'صندوق متوسط الحجم - أجهزة إلكترونية',
          contactNumber: '0512345678'
        },
        {
          id: '2',
          trackingNumber: 'SD-20250416-002',
          createdAt: '2025-04-16 11:45',
          deliveryDate: null,
          status: 'inProgress',
          price: 85,
          commissionRate: 0.15,
          customerName: 'سارة عبدالله',
          driverName: 'محمد السعيد',
          pickupLocation: 'حي العليا، الرياض',
          deliveryLocation: 'حي الياسمين، الرياض',
          packageDetails: 'صندوق صغير - وثائق',
          contactNumber: '0523456789'
        },
        {
          id: '3',
          trackingNumber: 'SD-20250416-003',
          createdAt: '2025-04-16 13:00',
          deliveryDate: null,
          status: 'pending',
          price: 150,
          commissionRate: 0.15,
          customerName: 'عبدالرحمن العتيبي',
          driverName: null,
          pickupLocation: 'حي الملقا، الرياض',
          deliveryLocation: 'حي الربيع، الرياض',
          packageDetails: 'صندوق كبير - أثاث منزلي صغير',
          contactNumber: '0534567890'
        },
        {
          id: '4',
          trackingNumber: 'SD-20250415-001',
          createdAt: '2025-04-15 16:20',
          deliveryDate: null,
          status: 'cancelled',
          price: 95,
          commissionRate: 0.15,
          customerName: 'نورة الدوسري',
          driverName: null,
          pickupLocation: 'حي الورود، الرياض',
          deliveryLocation: 'حي الروضة، الرياض',
          packageDetails: 'صندوق متوسط - كتب',
          contactNumber: '0545678901'
        },
        {
          id: '5',
          trackingNumber: 'SD-20250415-002',
          createdAt: '2025-04-15 14:10',
          deliveryDate: '2025-04-15 17:45',
          status: 'delivered',
          price: 110,
          commissionRate: 0.15,
          customerName: 'فيصل الشمري',
          driverName: 'عبدالله القحطاني',
          pickupLocation: 'حي الخزامى، الرياض',
          deliveryLocation: 'حي العارض، الرياض',
          packageDetails: 'صندوق متوسط - ملابس',
          contactNumber: '0556789012'
        }
      ];
      setOrders(mockOrders);
    }, 500);
  }, []);

  useEffect(() => {
    // Check if admin is authenticated
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

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleCancelOrder = () => {
    if (!selectedOrder) return;
    
    // In a real app, this would call an API
    toast.success(`تم إلغاء الطلب ${selectedOrder.trackingNumber} بنجاح`);
    
    // Update local state
    setOrders(prev => 
      prev.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: 'cancelled' as const } 
          : order
      )
    );
    
    setDetailsDialogOpen(false);
    setSelectedOrder(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-blue-500">قيد الانتظار</Badge>;
      case 'inProgress':
        return <Badge className="bg-yellow-500">جاري التوصيل</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">تم التوصيل</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">ملغي</Badge>;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.driverName && order.driverName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterStatus === 'all') {
      return matchesSearch;
    } else {
      return matchesSearch && order.status === filterStatus;
    }
  });

  const pendingOrders = filteredOrders.filter(order => order.status === 'pending');
  const inProgressOrders = filteredOrders.filter(order => order.status === 'inProgress');
  const deliveredOrders = filteredOrders.filter(order => order.status === 'delivered');
  const cancelledOrders = filteredOrders.filter(order => order.status === 'cancelled');

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
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  className="pl-10 pr-4" 
                  placeholder="ابحث برقم التتبع، اسم العميل أو السائق" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="inProgress">جاري التوصيل</SelectItem>
                  <SelectItem value="delivered">تم التوصيل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">طلبات قيد الانتظار</p>
                      <p className="text-xl font-bold">{pendingOrders.length}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Clock className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">طلبات جاري توصيلها</p>
                      <p className="text-xl font-bold">{inProgressOrders.length}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <MapPin className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">طلبات تم توصيلها</p>
                      <p className="text-xl font-bold">{deliveredOrders.length}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <PackageIcon className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">طلبات ملغية</p>
                      <p className="text-xl font-bold">{cancelledOrders.length}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-6">
                <TabsTrigger value="all">جميع الطلبات</TabsTrigger>
                <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
                <TabsTrigger value="inProgress">جاري التوصيل</TabsTrigger>
                <TabsTrigger value="delivered">تم التوصيل</TabsTrigger>
                <TabsTrigger value="cancelled">ملغي</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <OrdersTable 
                  orders={filteredOrders} 
                  onViewDetails={handleViewDetails} 
                  getStatusBadge={getStatusBadge} 
                />
              </TabsContent>
              
              <TabsContent value="pending">
                <OrdersTable 
                  orders={pendingOrders} 
                  onViewDetails={handleViewDetails} 
                  getStatusBadge={getStatusBadge} 
                />
              </TabsContent>
              
              <TabsContent value="inProgress">
                <OrdersTable 
                  orders={inProgressOrders} 
                  onViewDetails={handleViewDetails} 
                  getStatusBadge={getStatusBadge} 
                />
              </TabsContent>
              
              <TabsContent value="delivered">
                <OrdersTable 
                  orders={deliveredOrders} 
                  onViewDetails={handleViewDetails} 
                  getStatusBadge={getStatusBadge} 
                />
              </TabsContent>
              
              <TabsContent value="cancelled">
                <OrdersTable 
                  orders={cancelledOrders} 
                  onViewDetails={handleViewDetails} 
                  getStatusBadge={getStatusBadge} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              تفاصيل الطلب #{selectedOrder?.trackingNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">معلومات الطلب</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">رقم التتبع:</p>
                      <p className="font-medium">{selectedOrder.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">تاريخ الإنشاء:</p>
                      <p className="font-medium">{selectedOrder.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">تاريخ التوصيل:</p>
                      <p className="font-medium">{selectedOrder.deliveryDate || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">حالة الطلب:</p>
                      <div>{getStatusBadge(selectedOrder.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">السعر:</p>
                      <p className="font-medium">{selectedOrder.price} ريال</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">العمولة ({selectedOrder.commissionRate * 100}%):</p>
                      <p className="font-medium">{(selectedOrder.price * selectedOrder.commissionRate).toFixed(2)} ريال</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">معلومات العميل والسائق</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">العميل:</p>
                      <p className="font-medium">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">السائق:</p>
                      <p className="font-medium">{selectedOrder.driverName || 'لم يتم تعيين سائق'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">رقم التواصل:</p>
                      <p className="font-medium">{selectedOrder.contactNumber}</p>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-500 mt-6 mb-2">معلومات التوصيل</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">موقع الاستلام:</p>
                      <p className="font-medium">{selectedOrder.pickupLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">موقع التوصيل:</p>
                      <p className="font-medium">{selectedOrder.deliveryLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">تفاصيل الشحنة:</p>
                      <p className="font-medium">{selectedOrder.packageDetails}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => window.open(`/admin/orders/${selectedOrder.id}`, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  عرض الصفحة الكاملة
                </Button>
                
                {(selectedOrder.status === 'pending' || selectedOrder.status === 'inProgress') && (
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelOrder}
                  >
                    إلغاء الطلب
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface OrdersTableProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

const OrdersTable = ({ orders, onViewDetails, getStatusBadge }: OrdersTableProps) => {
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
                <th className="px-6 py-3 text-right font-medium text-gray-500">رقم التتبع</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">تاريخ الإنشاء</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">العميل</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">السائق</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">السعر</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الحالة</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{order.trackingNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.driverName || '-'}</td>
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

// Wrap the component with LanguageProvider
const Orders = () => {
  return (
    <LanguageProvider>
      <OrdersContent />
    </LanguageProvider>
  );
};

export default Orders;
