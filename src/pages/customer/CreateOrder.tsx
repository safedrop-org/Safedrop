
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package, Truck, DollarSign, Calculator } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { calculateCost } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { set } from 'date-fns';

interface LocationType {
  address: string;
  details?: string;
}

const CreateOrderContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pickupLocation: {
      address: '',
      details: ''
    } as LocationType,
    dropoffLocation: {
      address: '',
      details: ''
    } as LocationType,
    packageDetails: '',
    notes: '',
    price: ''
  });

  useEffect(() => {
    if (!user) {
      toast.error(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
      navigate('/login');
    }
  }, [user, navigate, language]);

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
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        price: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
      return;
    }
    if (!formData.pickupLocation.address || !formData.dropoffLocation.address || !formData.packageDetails || !formData.price) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول الإلزامية' : 'Please fill in all required fields');
      return;
    }
    const price = parseFloat(formData.price);
    const res = await fetch(`/google-api/maps/api/directions/json?origin=${encodeURIComponent(formData.pickupLocation.address)}&destination=${encodeURIComponent(formData.dropoffLocation.address)}&mode=driving&key=AIzaSyCv_hgUtyxSMajB8lOjEV1Hj8vRYYRb9Rk`)
    const data = await res.json();
    
    
    if (data.status !== 'OK') {
      toast.error(language === 'ar' ? 'حدث خطأ أثناء حساب المسافة' : 'Error calculating distance');
      return;
    }
    
    const distance = data.routes[0].legs[0].distance.value; // in meters
    const fare = calculateCost(distance)

    if (isNaN(price)) {
      toast.error(language === 'ar' ? 'يرجى إدخال سعر صحيح' : 'Please enter a valid price');
      return;
    }

    const minFare = fare <= 10 ? 10 : Math.floor(fare * 0.7 * 100) / 100;

    if(Number(price) < minFare) {
      toast.error(language === 'ar' ? `السعر المدخل منخفض مقارنة بالسعر المقترح ${minFare} ر.س. وقد لا يتم قبول الطلب` : `The entered price is low compared to the suggested price ${minFare} SAR, and the order may not be accepted`);
      return;
    }

    setSubmitting(true);
    try {
      const {
        data,
        error
      } = await supabase.from('orders').insert([{
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
        price: price,
        status: 'available',
        payment_status: 'pending',
        commission_rate: 0.15
      }]).select();
      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }
      toast.success(language === 'ar' ? 'تم إنشاء الطلب بنجاح' : 'Order created successfully');
      navigate('/customer/orders');
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error((language === 'ar' ? 'حدث خطأ أثناء إنشاء الطلب: ' : 'Error creating order: ') + (error.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">{t('createOrder')}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t('pickupInfo')}</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pickupAddress">{t('pickupAddress')}</Label>
                    <Input 
                      id="pickupAddress" 
                      placeholder={t('enterPickupAddress')} 
                      value={formData.pickupLocation.address} 
                      onChange={e => handleLocationChange('pickupLocation', 'address', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickupDetails">{t('additionalDetails')}</Label>
                    <Input 
                      id="pickupDetails" 
                      placeholder={t('buildingNumFloor')} 
                      value={formData.pickupLocation.details} 
                      onChange={e => handleLocationChange('pickupLocation', 'details', e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t('deliveryInfo')}</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dropoffAddress">{t('deliveryAddress')}</Label>
                    <Input 
                      id="dropoffAddress" 
                      placeholder={t('enterDeliveryAddress')} 
                      value={formData.dropoffLocation.address} 
                      onChange={e => handleLocationChange('dropoffLocation', 'address', e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="dropoffDetails">{t('additionalDetails')}</Label>
                    <Input 
                      id="dropoffDetails" 
                      placeholder={t('buildingNumFloor')} 
                      value={formData.dropoffLocation.details} 
                      onChange={e => handleLocationChange('dropoffLocation', 'details', e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          <CalculateOrderCost
            pickupLocation={formData.pickupLocation.address}
            dropoffLocation={formData.dropoffLocation.address}
          />

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Package className="h-5 w-5 ml-2 text-safedrop-gold" />
              {t('shipmentDetails')}
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="price" className="block mb-1 font-medium text-gray-700">
                  {t('price')}
                </Label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input 
                    id="price" 
                    name="price" 
                    type="text" 
                    className="pl-10 text-left" 
                    placeholder="0.00" 
                    value={formData.price} 
                    onChange={handlePriceChange} 
                    required 
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">{t('driverCommission')}</p>
              </div>

              <div>
                <Label htmlFor="packageDetails">{t('packageDescription')}</Label>
                <Textarea 
                  id="packageDetails" 
                  name="packageDetails" 
                  placeholder={t('contentsSizeWeight')} 
                  rows={3} 
                  value={formData.packageDetails} 
                  onChange={handleTextChange} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="notes">{t('driverNotes')}</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  placeholder={t('specialInstructions')} 
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
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              className="bg-safedrop-gold hover:bg-safedrop-gold/90 gap-2" 
              disabled={submitting}
            >
              {submitting ? t('sending') : (
                <>
                  <Truck className="h-4 w-4" />
                  {t('submitOrder')}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

const CalculateOrderCost = ({ pickupLocation, dropoffLocation }) => {
  const { t, language } = useLanguage();
  const [price, setPrice] = useState('-');
  const [distance, setDistance] = useState('-');
  const [duration, setDuration] = useState('-');

  const handleOnclick = async () => {
    try {
      setPrice('-');
      setDistance('-');
      setDuration('-');
      
      
      const res = await fetch(`/a/directions/json?origin=${encodeURIComponent(pickupLocation)}&destination=${encodeURIComponent(dropoffLocation)}&mode=driving&key=AIzaSyCv_hgUtyxSMajB8lOjEV1Hj8vRYYRb9Rk`)
      const data = await res.json();
            
      if (data.status !== 'OK') {
        toast.error(language === 'ar' ? 'حدث خطأ أثناء حساب المسافة' : 'Error calculating distance');
        return;
      }
      
      setDistance(data.routes[0].legs[0].distance.text);
      setDuration(data.routes[0].legs[0].duration.text);
      
      const distance = data.routes[0].legs[0].distance.value; // in meters
      const fare = calculateCost(distance)
      setPrice(fare <= 10 ? '10 ر.س' : Math.floor(fare * 100) / 100 + ' ر.س');
    } catch (error) {
      console.log(error);
    }
  }

  return (
    
    <div className="grid grid-cols-4 gap-4 mt-1 items-center justify-items-center text-center">
      <Button onClick={handleOnclick} type='button'>
        <Calculator/> احسب التكلفة
      </Button>
      <div className="bg-gray-50 rounded p-2">
        <p className="text-sm text-gray-500">المسافة</p>
        <p className="font-medium">{distance}</p>
      </div>
      <div className="bg-gray-50 rounded p-2">
        <p className="text-sm text-gray-500">الوقت المتوقع</p>
        <p className="font-medium">{duration}</p>
      </div>
      <div className="bg-gray-50 rounded p-2">
        <p className="text-sm text-gray-500">المبلغ المتوقع</p>
        <p className="font-medium">{price}</p>
      </div>
    </div>
  )
}

const CreateOrder = () => {
  return (
    <LanguageProvider>
      <CreateOrderContent />
    </LanguageProvider>
  );
};

export default CreateOrder;
