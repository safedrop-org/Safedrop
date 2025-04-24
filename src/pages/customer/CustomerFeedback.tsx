
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Star, Send } from 'lucide-react';

const CustomerFeedback = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCompletedOrders = async () => {
      try {
        // Get completed orders that don't have ratings yet
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            driver_id,
            pickup_location,
            dropoff_location,
            driver:profiles!orders_driver_id_fkey(first_name, last_name)
          `)
          .eq('customer_id', user.id)
          .eq('status', 'completed');
        
        if (error) throw error;
        
        // Check which orders already have ratings
        const { data: existingRatings, error: ratingsError } = await supabase
          .from('driver_ratings')
          .select('order_id')
          .in('order_id', data.map(order => order.id));
          
        if (ratingsError) throw ratingsError;
        
        // Filter out orders that already have ratings
        const ratedOrderIds = existingRatings.map(rating => rating.order_id);
        const unratedOrders = data.filter(order => !ratedOrderIds.includes(order.id));
        
        setOrders(unratedOrders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('حدث خطأ أثناء تحميل الطلبات المكتملة');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedOrders();
  }, [user]);

  const handleRatingChange = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast.error('يرجى اختيار تقييم من 1 إلى 5');
      return;
    }
    
    if (!selectedOrder) {
      toast.error('يرجى اختيار طلب للتقييم');
      return;
    }

    const selectedOrderData = orders.find(order => order.id === selectedOrder);
    if (!selectedOrderData || !selectedOrderData.driver_id) {
      toast.error('بيانات الطلب أو السائق غير متوفرة');
      return;
    }

    setSubmitting(true);
    try {
      // Submit the rating to the driver_ratings table
      const { error } = await supabase
        .from('driver_ratings')
        .insert({
          driver_id: selectedOrderData.driver_id,
          order_id: selectedOrder,
          rating: rating,
          comment: comment
        });
      
      if (error) throw error;
      
      toast.success('تم إرسال تقييمك بنجاح');
      setRating(null);
      setComment('');
      setSelectedOrder(null);
      
      // Remove the rated order from the list
      setOrders(orders.filter(order => order.id !== selectedOrder));
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
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">التقييم والملاحظات</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">تقييم الخدمة</h2>
              
              {orders.length > 0 ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="order" className="block mb-1 font-semibold text-gray-700">اختر الطلب للتقييم</label>
                    <select 
                      id="order" 
                      className="w-full rounded border border-gray-300 px-3 py-2"
                      value={selectedOrder || ''}
                      onChange={(e) => setSelectedOrder(e.target.value)}
                      required
                    >
                      <option value="">اختر طلباً</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {formatDate(order.created_at)} - {order.driver ? `${order.driver.first_name} ${order.driver.last_name}` : 'غير معروف'}
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
                          onClick={() => handleRatingChange(value)}
                        >
                          <Star 
                            className={`h-8 w-8 ${rating && value <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="comment" className="block mb-1 font-semibold text-gray-700">ملاحظات (اختياري)</label>
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
                    className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                    disabled={submitting || !rating || !selectedOrder}
                  >
                    {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
                    {!submitting && <Send className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded-lg">
                  <Star className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  <p>لا توجد طلبات مكتملة متاحة للتقييم</p>
                </div>
              )}
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">تعليمات التقييم</h2>
              <ul className="space-y-2 text-gray-700 list-disc list-inside">
                <li>يمكنك تقييم الطلبات المكتملة فقط</li>
                <li>يرجى تقييم تجربتك الكاملة مع الخدمة</li>
                <li>يمكنك إضافة ملاحظات لمساعدتنا على التحسين</li>
                <li>يؤثر تقييمك على مستوى السائق وجودة الخدمة</li>
                <li>لا يمكنك تعديل التقييم بعد إرساله</li>
              </ul>
              
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-2">معايير التقييم:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm">ضعيف جداً</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm">ضعيف</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm">متوسط</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm">جيد</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm">ممتاز</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerFeedback;
