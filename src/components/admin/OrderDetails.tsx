
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { MapPinIcon, PhoneIcon, CalendarIcon } from "lucide-react";

interface OrderDetailsProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export function OrderDetails({ order, isOpen, onClose, onStatusUpdate }: OrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm({
    defaultValues: {
      status: order?.status || "pending",
      notes: order?.notes || "",
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "pending": return "قيد الانتظار";
      case "approved": return "موافق عليه";
      case "in_transit": return "قيد التوصيل";
      case "approaching": return "اقترب";
      case "completed": return "مكتمل";
      case "cancelled": return "ملغي";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_transit": return "bg-purple-100 text-purple-800 border-purple-200";
      case "approaching": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const onSubmit = async (data: any) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: data.status,
          notes: data.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;
      
      toast.success('تم تحديث حالة الطلب بنجاح');
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>تفاصيل الطلب #{order.id}</span>
            <Badge 
              variant="outline" 
              className={getStatusColor(order.status)}
            >
              {getStatusLabel(order.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">معلومات العميل</h3>
            <div className="space-y-2">
              <p className="text-gray-700">
                {order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'غير معروف'}
              </p>
              {order.customer?.phone && (
                <p className="flex items-center text-gray-600 text-sm">
                  <PhoneIcon className="h-4 w-4 ml-1" />
                  {order.customer.phone}
                </p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-lg mt-4">معلومات السائق</h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  {order.driver ? `${order.driver.first_name} ${order.driver.last_name}` : 'لم يتم تعيين سائق'}
                </p>
                {order.driver?.phone && (
                  <p className="flex items-center text-gray-600 text-sm">
                    <PhoneIcon className="h-4 w-4 ml-1" />
                    {order.driver.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">تفاصيل الطلب</h3>
              <p className="flex items-center text-gray-600 text-sm mt-2">
                <CalendarIcon className="h-4 w-4 ml-1" />
                {formatDate(order.created_at)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-500">السعر</p>
                <p className="font-medium">{order.price ? `${order.price} ر.س` : 'غير محدد'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-500">حالة الدفع</p>
                <Badge variant="outline" className={
                  order.payment_status === "paid" ? "bg-green-100 text-green-800 border-green-200" :
                  order.payment_status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                  "bg-purple-100 text-purple-800 border-purple-200"
                }>
                  {order.payment_status === "paid" ? "مدفوع" :
                  order.payment_status === "pending" ? "غير مدفوع" :
                  "مسترد"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">نقطة الانطلاق</p>
                  <p className="text-sm">
                    {order.pickup_location?.formatted_address || 'غير محدد'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="mt-1 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="h-3 w-3 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">نقطة الوصول</p>
                  <p className="text-sm">
                    {order.dropoff_location?.formatted_address || 'غير محدد'}
                  </p>
                </div>
              </div>
            </div>

            {order.estimated_distance && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">المسافة المقدرة</p>
                  <p className="font-medium">{order.estimated_distance} كم</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">المدة المقدرة</p>
                  <p className="font-medium">{order.estimated_duration} دقيقة</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تحديث حالة الطلب</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة الطلب" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="approved">موافق عليه</SelectItem>
                      <SelectItem value="in_transit">قيد التوصيل</SelectItem>
                      <SelectItem value="approaching">اقترب</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أضف أي ملاحظات أو تعليقات هنا..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="ml-2"
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={isUpdating}
              >
                {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
