
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package, Truck } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface LocationType {
  address: string;
  details?: string;
}

const CreateOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    pickupLocation: { address: '', details: '' } as LocationType,
    dropoffLocation: { address: '', details: '' } as LocationType,
    packageDetails: '',
    notes: ''
  });

  useEffect(() => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLocationChange = (type: 'pickupLocation' | 'dropoffLocation', field: 'address' | 'details', value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    if (!formData.pickupLocation.address || !formData.dropoffLocation.address || !formData.packageDetails) {
      toast.error('يرجى ملء جميع الحقول الإلزامية');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting order with data:', {
        customer_id: user.id,
        pickup_location: formData.pickupLocation,
        dropoff_location: formData.dropoffLocation,
        package_details: formData.packageDetails,
        notes: formData.notes,
        status: 'available',
      });

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          customer_id: user.id,
          pickup_location: {
            address: formData.pickupLocation.address,
            details: formData.pickupLocation.details || ''
          },
          dropoff_location: {
            address: formData.dropoffLocation.address,
            details: formData.dropoffLocation.details || ''
          },
          package_details: formData.packageDetails,
          notes: formData.notes,
          status: 'available',
          payment_status: 'pending'
        }])
        .select();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }
      
      toast.success('تم إنشاء الطلب بنجاح');
      navigate('/customer/orders');
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error('حدث خطأ أثناء إنشاء الطلب: ' + (error.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">طلب جديد</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="space-y-4">
                <label className="block text-lg font-semibold mb-2">معلومات الاستلام</label>
                <div>
                  <label className="block mb-1">العنوان</label>
                  <Input
                    value={formData.pickupLocation.address}
                    onChange={(e) => handleLocationChange('pickupLocation', 'address', e.target.value)}
                    placeholder="أدخل عنوان الاستلام"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">تفاصيل إضافية</label>
                  <Input
                    value={formData.pickupLocation.details || ''}
                    onChange={(e) => handleLocationChange('pickupLocation', 'details', e.target.value)}
                    placeholder="رقم المبنى، الطابق، علامات مميزة"
                  />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="space-y-4">
                <label className="block text-lg font-semibold mb-2">معلومات التوصيل</label>
                <div>
                  <label className="block mb-1">العنوان</label>
                  <Input
                    value={formData.dropoffLocation.address}
                    onChange={(e) => handleLocationChange('dropoffLocation', 'address', e.target.value)}
                    placeholder="أدخل عنوان التوصيل"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">تفاصيل إضافية</label>
                  <Input
                    value={formData.dropoffLocation.details || ''}
                    onChange={(e) => handleLocationChange('dropoffLocation', 'details', e.target.value)}
                    placeholder="رقم المبنى، الطابق، علامات مميزة"
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
                  onChange={handleTextChange}
                  required
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
                  onChange={handleTextChange}
                />
              </div>
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
                'جاري الإرسال...'
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
