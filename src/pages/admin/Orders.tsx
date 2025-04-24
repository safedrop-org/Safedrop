
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, Download } from "lucide-react";
import { Input } from "@/components/ui/input";

// بيانات تجريبية للطلبات
const demoOrders = [
  {
    id: "ORD-001",
    customer: "محمد أحمد",
    driver: "خالد محمود",
    date: "2023-04-15",
    price: "125 ر.س",
    status: "مكتمل",
    paymentStatus: "مدفوع"
  },
  {
    id: "ORD-002",
    customer: "فهد عبدالله",
    driver: "سالم سعيد",
    date: "2023-04-16",
    price: "87 ر.س",
    status: "نشط",
    paymentStatus: "مدفوع"
  },
  {
    id: "ORD-003",
    customer: "أسماء خالد",
    driver: "عبدالرحمن علي",
    date: "2023-04-16",
    price: "200 ر.س",
    status: "قيد الانتظار",
    paymentStatus: "غير مدفوع"
  },
  {
    id: "ORD-004",
    customer: "سارة محمد",
    driver: "طارق زياد",
    date: "2023-04-17",
    price: "150 ر.س",
    status: "ملغي",
    paymentStatus: "مسترد"
  },
  {
    id: "ORD-005",
    customer: "نورة سعد",
    driver: "فيصل ناصر",
    date: "2023-04-17",
    price: "175 ر.س",
    status: "نشط",
    paymentStatus: "مدفوع"
  }
];

// مكون لعرض الطلبات مع التصفية
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
            <TableCell>{order.customer}</TableCell>
            <TableCell>{order.driver}</TableCell>
            <TableCell>{order.date}</TableCell>
            <TableCell>{order.price}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  order.status === "مكتمل" ? "bg-green-100 text-green-800 border-green-200" :
                  order.status === "نشط" ? "bg-blue-100 text-blue-800 border-blue-200" :
                  order.status === "قيد الانتظار" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                  "bg-red-100 text-red-800 border-red-200"
                }
              >
                {order.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  order.paymentStatus === "مدفوع" ? "bg-green-100 text-green-800 border-green-200" :
                  order.paymentStatus === "غير مدفوع" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                  "bg-purple-100 text-purple-800 border-purple-200"
                }
              >
                {order.paymentStatus}
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
  
  // تصفية الطلبات حسب مصطلح البحث
  const filteredOrders = demoOrders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.driver.toLowerCase().includes(searchTerm.toLowerCase())
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
              <TabsTrigger value="نشط">نشط</TabsTrigger>
              <TabsTrigger value="قيد الانتظار">قيد الانتظار</TabsTrigger>
              <TabsTrigger value="مكتمل">مكتمل</TabsTrigger>
              <TabsTrigger value="ملغي">ملغي</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <OrdersTable orders={filteredOrders} status="all" />
            </TabsContent>
            
            <TabsContent value="نشط" className="mt-0">
              <OrdersTable orders={filteredOrders} status="نشط" />
            </TabsContent>
            
            <TabsContent value="قيد الانتظار" className="mt-0">
              <OrdersTable orders={filteredOrders} status="قيد الانتظار" />
            </TabsContent>
            
            <TabsContent value="مكتمل" className="mt-0">
              <OrdersTable orders={filteredOrders} status="مكتمل" />
            </TabsContent>
            
            <TabsContent value="ملغي" className="mt-0">
              <OrdersTable orders={filteredOrders} status="ملغي" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
