
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package, Truck, DollarSign, MapPin, XCircle, CheckCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import LocationInput from '@/components/maps/LocationInput';
import DistanceDisplay from '@/components/maps/DistanceDisplay';

interface LocationType {
  address: string;
  details?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const CreateOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { isLoaded, loadError, calculateDistance, geocodeAddress } = useGoogleMaps();
  const [distance, setDistance] = useState<number | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [formData, setFormData] = useState({
    pickupLocation: { address: '', details: '' } as LocationType,
    dropoffLocation: { address: '', details: '' } as LocationType,
    packageDetails: '',
    notes: '',
    price: '' // New price field
  });

  useEffect(() => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isLoaded) {
      toast.success('تم تحميل خرائط جوجل بنجاح', {
        icon: <CheckCircle className="h-5 w-5" />,
      });
    } else if (loadError) {
      toast.error('فشل في تحميل خرائط جوجل - تحقق من اتصالك بالإنترنت', {
        icon: <XCircle className="h-5 w-5" />,
      });
    } else {
      toast('جاري تحميل خرائط جوجل...', {
        icon: <MapPin className="h-5 w-5" />,
      });
    }
  }, [isLoaded, loadError]);

  useEffect(() => {
    const calculateDistanceAndPrice = async () => {
      if (!formData.pickupLocation.address || !formData.dropoffLocation.address) {
        setDistance(null);
        setCalculatedPrice(null);
        return;
      }
      
      if (formData.pickupLocation.address.trim() && formData.dropoffLocation.address.trim()) {
        setIsCalculating(true);
        try {
          console.log('Calculating distance between locations');
          const distanceKm = await calculateDistance(
            formData.pickupLocation.address,
            formData.dropoffLocation.address
          );
          
          if (distanceKm !== null) {
            console.log(`Distance calculated: ${distanceKm} km`);
            setDistance(distanceKm);
            
            const basePrice = 10;
            const additionalKm = Math.max(0, distanceKm - 2);
            const additionalPrice = additionalKm * 1.5;
            const totalPrice = basePrice + additionalPrice;
            
            console.log(`Price calculated: ${totalPrice} SAR`);
            setCalculatedPrice(totalPrice);
            
            setFormData(prev => ({
              ...prev,
              price: totalPrice.toFixed(2)
            }));

            toast.success(`تم حساب المسافة: ${distanceKm.toFixed(2)} كم والتكلفة: ${totalPrice.toFixed(2)} ريال`);
          } else {
            console.warn('Distance calculation failed');
            setDistance(null);
            setCalculatedPrice(null);
            toast.error('تعذر حساب المسافة بين الموقعين');
          }
        } catch (error) {
          console.error('Error calculating distance:', error);
          toast.error('فشل في حساب المسافة');
        } finally {
          setIsCalculating(false);
        }
      }
    };

    calculateDistanceAndPrice();
  }, [formData.pickupLocation.address, formData.dropoffLocation.address, calculateDistance]);

  const handleLocationChange = (type: 'pickupLocation' | 'dropoffLocation', location: LocationType) => {
    console.log(`Location changed (${type}):`, location);
    setFormData(prev => ({
      ...prev,
      [type]: location
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    if (!formData.pickupLocation.address || !formData.dropoffLocation.address || !formData.packageDetails || !formData.price) {
      toast.error('يرجى ملء جميع الحقول الإلزامية');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('يرجى إدخال سعر صحيح');
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
        price: price,
        status: 'available',
        commission_rate: 0.15,
      });

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          customer_id: user.id,
          pickup_location: {
            address: formData.pickupLocation.address,
            details: formData.pickupLocation.details || '',
            ...(formData.pickupLocation.coordinates && { coordinates: formData.pickupLocation.coordinates })
          },
          dropoff_location: {
            address: formData.dropoffLocation.address,
            details: formData.dropoffLocation.details || '',
            ...(formData.dropoffLocation.coordinates && { coordinates: formData.dropoffLocation.coordinates })
          },
          package_details: formData.packageDetails,
          notes: formData.notes,
          price: price,
          status: 'available',
          payment_status: 'pending',
          commission_rate: 0.15,
          distance_km: distance || null
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
                <LocationInput
                  label="موقع الاستلام"
                  placeholder="أدخل عنوان الاستلام"
                  detailsPlaceholder="رقم المبنى، الطابق، علامات مميزة"
                  value={formData.pickupLocation}
                  onChange={(location) => handleLocationChange('pickupLocation', location)}
                  className="space-y-4"
                  isLoaded={isLoaded}
                  geocodeAddress={geocodeAddress}
                />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="space-y-4">
                <label className="block text-lg font-semibold mb-2">معلومات التوصيل</label>
                <LocationInput
                  label="موقع التوصيل"
                  placeholder="أدخل عنوان التوصيل"
                  detailsPlaceholder="رقم المبنى، الطابق، علامات مميزة"
                  value={formData.dropoffLocation}
                  onChange={(location) => handleLocationChange('dropoffLocation', location)}
                  className="space-y-4"
                  isLoaded={isLoaded}
                  geocodeAddress={geocodeAddress}
                />
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DistanceDisplay 
              distance={distance}
              price={calculatedPrice}
              isCalculating={isCalculating}
            />
          
            <Card className="p-6 md:col-span-2">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Package className="h-5 w-5 ml-2 text-safedrop-gold" />
                تفاصيل الشحنة
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="price" className="block mb-1 font-medium text-gray-700">
                    السعر (ريال)
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
                  <p className="text-sm text-gray-500 mt-1">
                    سيحصل السائق على 75% من السعر والمنصة على 15%
                  </p>
                </div>

                <div>
                  <Label htmlFor="packageDetails" className="block mb-1 font-medium text-gray-700">
                    وصف الشحنة
                  </Label>
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
                  <Label htmlFor="notes" className="block mb-1 font-medium text-gray-700">
                    ملاحظات للسائق
                  </Label>
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
          </div>
          
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
