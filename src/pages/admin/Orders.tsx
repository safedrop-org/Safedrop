import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, Download } from "lucide-react"; // Added Download import here
import { Input } from "@/components/ui/input";
import { useOrders } from "@/hooks/useOrders";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { toast } from "sonner";

const OrdersTable = ({ orders, status, onViewOrder }) => {
  const filteredOrders = status === "all" ? orders : orders.filter(order => order.status === status);
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>رقم الطلب</TableHead>
          <TableHead>العميل</TableHead>
          <TableHead>السائق</TableHead>
          <TableHead>التاريخ</TableHead>
          <TableHead>السعر</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>حالة الدفع</TableHead>
          <TableHead>الإجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredOrders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="h-24 text-center">
              لا توجد طلبات في هذه الفئة
            </TableCell>
          </TableRow>
        ) : (
          filteredOrders.map(order => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
              <TableCell>{order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'غير معروف'}</TableCell>
              <TableCell>{order.driver ? `${order.driver.first_name} ${order.driver.last_name}` : 'غير معين'}</TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString('ar-SA')}</TableCell>
              <TableCell>{order.price ? `${order.price} ر.س` : 'غير محدد'}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    order.status === "completed" ? "bg-green-100 text-green-800 border-green-200" :
                    order.status === "approved" ? "bg-blue-100 text-blue-800 border-blue-200" :
                    order.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                    order.status === "in_transit" ? "bg-purple-100 text-purple-800 border-purple-200" :
                    order.status === "approaching" ? "bg-indigo-100 text-indigo-800 border-indigo-200" :
                    "bg-red-100 text-red-800 border-red-200"
                  }
                >
                  {order.status === "completed" ? "مكتمل" :
                   order.status === "approved" ? "موافق عليه" :
                   order.status === "pending" ? "قيد الانتظار" :
                   order.status === "in_transit" ? "قيد التوصيل" :
                   order.status === "approaching" ? "اقترب" :
                   "ملغي"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    order.payment_status === "paid" ? "bg-green-100 text-green-800 border-green-200" :
                    order.payment_status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                    "bg-purple-100 text-purple-800 border-purple-200"
                  }
                >
                  {order.payment_status === "paid" ? "مدفوع" :
                   order.payment_status === "pending" ? "غير مدفوع" :
                   "مسترد"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => onViewOrder(order)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { data: orders = [], isLoading, error, refetch } = useOrders(true); // Pass true for admin view
  
  React.useEffect(() => {
    if (error) {
      console.error("Error fetching orders:", error);
      toast.error('حدث خطأ أثناء تحميل الطلبات');
    }
  }, [error]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleOrderStatusUpdate = () => {
    refetch();
    toast.success('تم تحديث الطلب بنجاح');
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleExportOrders = () => {
    // Create CSV data
    const headers = ["رقم الطلب", "العميل", "السائق", "التاريخ", "السعر", "الحالة", "حالة الدفع"];
    
    const csvData = orders.map(order => [
      order.id,
      order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'غير معروف',
      order.driver ? `${order.driver.first_name} ${order.driver.last_name}` : 'غير معين',
      new Date(order.created_at).toLocaleDateString('ar-SA'),
      order.price ? `${order.price} ر.س` : 'غير محدد',
      order.status,
      order.payment_status
    ]);
    
    // Convert to CSV string
    let csvContent = headers.join(",") + "\n";
    csvData.forEach(row => {
      csvContent += row.join(",") + "\n";
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('تم تصدير الطلبات بنجاح');
  };
  
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customer && `${order.customer.first_name} ${order.customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.driver && `${order.driver.first_name} ${order.driver.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="p-6 flex flex-col min-h-svh">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">إدارة الطلبات</h1>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="بحث عن طلب..." 
              className="pl-9" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="outline" className="gap-2" onClick={handleExportOrders}>
            <Download size={16} />
            تصدير الطلبات
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          <p>حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة مرة أخرى لاحقاً.</p>
          <Button 
            onClick={() => refetch()} 
            className="mt-2"
            variant="outline"
          >
            إعادة المحاولة
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>جميع الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 grid grid-cols-6 w-full">
                <TabsTrigger value="all" className="flex-1 text-center whitespace-nowrap px-4">الكل</TabsTrigger>
                <TabsTrigger value="pending" className="flex-1 text-center whitespace-nowrap px-4">قيد الإنتظار</TabsTrigger>
                <TabsTrigger value="approved" className="flex-1 text-center whitespace-nowrap px-4">مقبول</TabsTrigger>
                <TabsTrigger value="rejected" className="flex-1 text-center whitespace-nowrap px-4">مرفوض</TabsTrigger>
                <TabsTrigger value="in_transit" className="flex-1 text-center whitespace-nowrap px-4">قيد التوصيل</TabsTrigger>
                <TabsTrigger value="completed" className="flex-1 text-center whitespace-nowrap px-4">مكتمل</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <OrdersTable orders={filteredOrders} status="all" onViewOrder={handleViewOrder} />
              </TabsContent>
              
              <TabsContent value="pending" className="mt-0">
                <OrdersTable orders={filteredOrders} status="pending" onViewOrder={handleViewOrder} />
              </TabsContent>
              
              <TabsContent value="approved" className="mt-0">
                <OrdersTable orders={filteredOrders} status="approved" onViewOrder={handleViewOrder} />
              </TabsContent>
              
              <TabsContent value="rejected" className="mt-0">
                <OrdersTable orders={filteredOrders} status="rejected" onViewOrder={handleViewOrder} />
              </TabsContent>
              
              <TabsContent value="in_transit" className="mt-0">
                <OrdersTable orders={filteredOrders} status="in_transit" onViewOrder={handleViewOrder} />
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0">
                <OrdersTable orders={filteredOrders} status="completed" onViewOrder={handleViewOrder} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {selectedOrder && (
        <OrderDetails 
          order={selectedOrder}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          onStatusUpdate={handleOrderStatusUpdate}
        />
      )}
    </div>
  );
};

export default Orders;
