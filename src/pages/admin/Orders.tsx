import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useOrders } from "@/hooks/useOrders";

const OrdersTable = ({ orders, status }) => {
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
        {filteredOrders.map(order => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.id}</TableCell>
            <TableCell>{order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'غير معروف'}</TableCell>
            <TableCell>{order.driver ? `${order.driver.first_name} ${order.driver.last_name}` : 'غير معين'}</TableCell>
            <TableCell>{new Date(order.created_at).toLocaleDateString('ar-SA')}</TableCell>
            <TableCell>{order.price ? `${order.price} ر.س` : 'غير محدد'}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  order.status === "completed" ? "bg-green-100 text-green-800 border-green-200" :
                  order.status === "active" ? "bg-blue-100 text-blue-800 border-blue-200" :
                  order.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                  "bg-red-100 text-red-800 border-red-200"
                }
              >
                {order.status === "completed" ? "مكتمل" :
                 order.status === "active" ? "نشط" :
                 order.status === "pending" ? "قيد الانتظار" :
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
              <Button variant="ghost" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: orders = [], isLoading } = useOrders();
  
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
          
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            تصدير الطلبات
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>جميع الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 grid grid-cols-5 max-w-md">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="active">نشط</TabsTrigger>
              <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
              <TabsTrigger value="completed">مكتمل</TabsTrigger>
              <TabsTrigger value="cancelled">ملغي</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <OrdersTable orders={filteredOrders} status="all" />
            </TabsContent>
            
            <TabsContent value="active" className="mt-0">
              <OrdersTable orders={filteredOrders} status="active" />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              <OrdersTable orders={filteredOrders} status="pending" />
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              <OrdersTable orders={filteredOrders} status="completed" />
            </TabsContent>
            
            <TabsContent value="cancelled" className="mt-0">
              <OrdersTable orders={filteredOrders} status="cancelled" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
