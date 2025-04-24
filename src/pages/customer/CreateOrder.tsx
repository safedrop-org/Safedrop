import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { MapPin, Package, Truck, FileText, Clock, DollarSign } from 'lucide-react';

const CreateOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    pickupAddress: '',
    pickupDetails: '',
    dropoffAddress: '',
    dropoffDetails: '',
    packageDetails: '',
    notes: ''
  });

  const [estimatedPrice, setEstimatedPrice] = useState(null);

  useEffect(() => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    if (!formData.pickupAddress || !formData.dropoffAddress) {
      toast.error('يرجى تعبئة عناوين الاستلام والتسليم');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          pickup_location: { 
            address: formData.pickupAddress,
            details: formData.pickupDetails
          },
          dropoff_location: {
            address: formData.dropoffAddress,
            details: formData.dropoffDetails
          },
          notes: formData.notes,
          status: 'pending',
          price: estimatedPrice || null,
        })
        .select();

      if (error) throw error;
      
      toast.success('تم إنشاء الطلب بنجاح');
      navigate('/customer/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('حدث خطأ أثناء إنشاء الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateEstimatedPrice = () => {
    if (!formData.pickupAddress || !formData.dropoffAddress) {
      toast.error('يرجى إدخال عناوين الاستلام والتسليم لحساب التكلفة التقديرية');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const basePrice = 20;
      const randomFactor = Math.random() * 30 + 10;
      setEstimatedPrice(Math.round(basePrice + randomFactor));
      setLoading(false);
      toast.success('تم حساب التكلفة التقديرية');
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">طلب جديد</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 ml-2 text-safedrop-gold" />
                معلومات الاستلام
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="pickupAddress" className="block mb-1 font-medium text-gray-700">عنوان الاستلام *</label>
                  <Input
                    id="pickupAddress"
                    name="pickupAddress"
                    placeholder="أدخل عنوان الاستلام التفصيلي"
                    value={formData.pickupAddress}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="pickupDetails" className="block mb-1 font-medium text-gray-700">تفاصيل إضافية</label>
                  <Textarea
                    id="pickupDetails"
                    name="pickupDetails"
                    placeholder="تفاصيل أخرى مثل رقم المبنى، الطابق، علامات مميزة"
                    rows={3}
                    value={formData.pickupDetails}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 ml-2 text-safedrop-gold" />
                معلومات التوصيل
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="dropoffAddress" className="block mb-1 font-medium text-gray-700">عنوان التوصيل *</label>
                  <Input
                    id="dropoffAddress"
                    name="dropoffAddress"
                    placeholder="أدخل عنوان التوصيل التفصيلي"
                    value={formData.dropoffAddress}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="dropoffDetails" className="block mb-1 font-medium text-gray-700">تفاصيل إضافية</label>
                  <Textarea
                    id="dropoffDetails"
                    name="dropoffDetails"
                    placeholder="تفاصيل أخرى مثل رقم المبنى، الطابق، علامات مميزة"
                    rows={3}
                    value={formData.dropoffDetails}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </Card>
          </div>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Package className="h-5 w-5 ml-2 text-safedrop-gold" />
              تفاصيل الشحنة
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="packageDetails" className="block mb-1 font-medium text-gray-700">وصف الشحنة</label>
                <Textarea
                  id="packageDetails"
                  name="packageDetails"
                  placeholder="وصف المحتويات، الحجم، الوزن التقريبي"
                  rows={3}
                  value={formData.packageDetails}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="notes" className="block mb-1 font-medium text-gray-700">ملاحظات للسائق</label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="أي تعليمات خاصة للسائق"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <DollarSign className="h-5 w-5 ml-2 text-safedrop-gold" />
              التكلفة والدفع
            </h2>
            
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
              <div className="flex-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={calculateEstimatedPrice}
                  disabled={loading || !formData.pickupAddress || !formData.dropoffAddress}
                >
                  {loading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      جاري الحساب...
                    </>
                  ) : (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      حساب التكلفة التقديرية
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex-1">
                {estimatedPrice !== null && (
                  <div className="bg-safedrop-primary/10 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">التكلفة التقديرية:</p>
                    <p className="text-2xl font-bold text-safedrop-primary">{estimatedPrice} ريال</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">ملاحظة: التكلفة النهائية قد تختلف عن التكلفة التقديرية.</p>
              <p className="text-sm text-gray-500">الدفع يتم عند التوصيل أو عبر التطبيق بعد تأكيد الطلب.</p>
            </div>
          </Card>
          
          <div className="flex justify-between items-center">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/customer/dashboard')}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              className="bg-safedrop-gold hover:bg-safedrop-gold/90 gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  إرسال الطلب
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateOrder;
