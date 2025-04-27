import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useOrders } from '@/hooks/useOrders';
import { useQueryClient } from '@tanstack/react-query';
import { LanguageProvider } from '@/components/ui/language-context';

const CustomerFeedbackContent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter only completed orders that haven't been rated yet
  const unratedCompletedOrders = orders?.filter(order => 
    order.status === 'completed' && order.driver_id
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedOrder || !rating) {
      toast.error('يرجى اختيار طلب وتقييم');
      return;
    }

    setSubmitting(true);
    try {
      const order = orders?.find(o => o.id === selectedOrder);
      if (!order?.driver_id) {
        throw new Error('لا يمكن العثور على معرف السائق');
      }

      // Check if rating already exists for this order
      const { data: existingRating, error: checkError } = await supabase
        .from('driver_ratings')
        .select('id')
        .eq('order_id', selectedOrder)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing rating:', checkError);
      }

      if (existingRating) {
        toast.error('لقد قمت بالفعل بتقييم هذا الطلب');
        setSubmitting(false);
        return;
      }

      // Insert new rating
      const { error } = await supabase
        .from('driver_ratings')
        .insert({
          driver_id: order.driver_id,
          order_id: selectedOrder,
          rating,
          comment: comment.trim() || null,
          customer_id: user.id // Explicitly set customer_id
        });

      if (error) {
        console.error('Error submitting rating:', error);
        throw error;
      }

      toast.success('تم إرسال تقييمك بنجاح');
      setSelectedOrder(null);
      setRating(null);
      setComment('');
      
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['driver_ratings'] });
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('حدث خطأ أثناء إرسال التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
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

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CustomerSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">التقييم والملاحظات</h1>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">تقييم الخدمة</h2>
          {unratedCompletedOrders.length > 0 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="order" className="block mb-1 font-semibold text-gray-700">
                  اختر الطلب للتقييم
                </label>
                <select 
                  id="order"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={selectedOrder || ''}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                  required
                >
                  <option value="">اختر طلباً</option>
                  {unratedCompletedOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {formatDate(order.created_at)} - {order.driver?.first_name} {order.driver?.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">التقييم</label>
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className="focus:outline-none"
                      onClick={() => setRating(value)}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          rating && value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block mb-1 font-semibold text-gray-700">
                  ملاحظات (اختياري)
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="أضف ملاحظاتك حول الخدمة هنا"
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={submitting || !rating || !selectedOrder}
              >
                {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>لا توجد طلبات مكتملة متاحة للتقييم</p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

const CustomerFeedback = () => {
  return (
    <LanguageProvider>
      <CustomerFeedbackContent />
    </LanguageProvider>
  );
};

export default CustomerFeedback;
