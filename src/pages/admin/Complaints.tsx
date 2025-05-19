import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageSquare, Check, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useComplaints } from "@/hooks/useComplaints";

const ComplaintsTable = ({ complaints, status = "all" }) => {
  const filteredComplaints =
    status === "all"
      ? complaints
      : complaints.filter((complaint) => complaint.status === status);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>رقم الشكوى</TableHead>
          <TableHead>المستخدم</TableHead>
          <TableHead>نوع المستخدم</TableHead>
          <TableHead>رقم الطلب</TableHead>
          <TableHead>المشكلة</TableHead>
          <TableHead>التاريخ</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>الإجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredComplaints.map((complaint) => (
          <TableRow key={complaint.id}>
            <TableCell className="font-medium">{complaint.id}</TableCell>
            <TableCell>{`${complaint.user.first_name} ${complaint.user.last_name}`}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  complaint.user.user_type === "customer"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-orange-100 text-orange-800 border-orange-200"
                }
              >
                {complaint.user.user_type === "customer" ? "عميل" : "سائق"}
              </Badge>
            </TableCell>
            <TableCell>{complaint.order?.id || "N/A"}</TableCell>
            <TableCell>{complaint.subject}</TableCell>
            <TableCell>
              {new Date(complaint.created_at).toLocaleDateString("ar-SA")}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  complaint.status === "resolved"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                }
              >
                {complaint.status === "resolved" ? "تم الحل" : "قيد المراجعة"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-blue-600">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                {complaint.status !== "resolved" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-600"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const Complaints = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUserType, setFilterUserType] = useState("all");
  const { data: complaints = [], isLoading } = useComplaints();

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${complaint.user.first_name} ${complaint.user.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (complaint.order?.id || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUserType =
      filterUserType === "all" || complaint.user.user_type === filterUserType;

    return matchesSearch && matchesUserType;
  });

  return (
    <div className="p-6 flex flex-col min-h-svh">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">إدارة الشكاوى والدعم</h1>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث عن شكوى..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            defaultValue={filterUserType}
            onValueChange={setFilterUserType}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="نوع المستخدم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="p-1" value="all">
                الجميع
              </SelectItem>
              <SelectItem className="p-1" value="customer">
                العملاء
              </SelectItem>
              <SelectItem className="p-1" value="driver">
                السائقين
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>جميع الشكاوى</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 grid grid-cols-2 max-w-[400px]">
              <TabsTrigger value="all">جميع الشكاوى</TabsTrigger>
              <TabsTrigger value="pending">قيد المراجعة</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <ComplaintsTable complaints={filteredComplaints} />
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              <ComplaintsTable
                complaints={filteredComplaints}
                status="قيد المراجعة"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Complaints;
