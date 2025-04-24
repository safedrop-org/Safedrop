
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package, Truck, Clock, DollarSign } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import LocationInput from '@/components/maps/LocationInput';
import DistanceDisplay from '@/components/maps/DistanceDisplay';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

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
  const { isLoaded, calculateDistance, geocodeAddress } = useGoogleMaps();
  
  const [submitting, setSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  
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

  const handlePickupLocationChange = (location: LocationType) => {
    setFormData(prev => ({ ...prev, pickupLocation: location }));
    // Reset calculated values when location changes
    setDistance(null);
    setCalculatedPrice(null);
  };

  const handleDropoffLocationChange = (location: LocationType) => {
    setFormData(prev => ({ ...prev, dropoffLocation: location }));
    // Reset calculated values when location changes
    setDistance(null);
    setCalculatedPrice(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculatePrice = (distanceInKm: number): number => {
    // Base price: 10 SAR minimum
    const basePrice = 10;
    
    // 1.5 SAR per km after first 2 km
    const additionalDistance = Math.max(0, distanceInKm - 2);
    const additionalCost = additionalDistance * 1.5;
    
    return basePrice + additionalCost;
  };

  const handleCalculateDistance = async () => {
    if (!formData.pickupLocation.coordinates || !formData.dropoffLocation.coordinates) {
      toast.error('يرجى تحديد مواقع الاستلام والتوصيل أولاً');
      return;
    }

    setIsCalculating(true);

    try {
      const distanceKm = await calculateDistance(
        formData.pickupLocation.address, 
        formData.dropoffLocation.address
      );

      if (distanceKm !== null) {
        setDistance(distanceKm);
        const price = calculatePrice(distanceKm);
        setCalculatedPrice(price);
        toast.success('تم حساب المسافة والتكلفة بنجاح');
      } else {
        toast.error('لم نتمكن من حساب المسافة بين الموقعين');
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      toast.error('حدث خطأ أثناء حساب المسافة');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    if (!formData.pickupLocation.coordinates || !formData.dropoffLocation.coordinates) {
      toast.error('يرجى تحديد مواقع الاستلام والتوصيل أولاً');
      return;
    }

    if (!calculatedPrice || !distance) {
      toast.error('يرجى حساب التكلفة قبل إرسال الطلب');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          pickup_location: {
            address: formData.pickupLocation.address,
            details: formData.pickupLocation.details,
            coordinates: formData.pickupLocation.coordinates
          },
          dropoff_location: {
            address: formData.dropoffLocation.address,
            details: formData.dropoffLocation.details,
            coordinates: formData.dropoffLocation.coordinates
          },
          estimated_distance: distance,
          notes: formData.notes,
          status: 'pending',
          price: calculatedPrice,
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

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">طلب جديد</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <LocationInput 
                label="معلومات الاستلام *"
                placeholder="أدخل عنوان الاستلام التفصيلي"
                detailsPlaceholder="تفاصيل أخرى مثل رقم المبنى، الطابق، علامات مميزة"
                value={formData.pickupLocation}
                onChange={handlePickupLocationChange}
                isLoaded={isLoaded}
                geocodeAddress={geocodeAddress}
              />
            </Card>
            
            <Card className="p-6">
              <LocationInput 
                label="معلومات التوصيل *"
                placeholder="أدخل عنوان التوصيل التفصيلي"
                detailsPlaceholder="تفاصيل أخرى مثل رقم المبنى، الطابق، علامات مميزة"
                value={formData.dropoffLocation}
                onChange={handleDropoffLocationChange}
                isLoaded={isLoaded}
                geocodeAddress={geocodeAddress}
              />
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
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <DollarSign className="h-5 w-5 ml-2 text-safedrop-gold" />
              حساب المسافة والتكلفة
            </h2>
            
            <div className="flex flex-col space-y-4">
              <Button 
                type="button" 
                onClick={handleCalculateDistance}
                disabled={isCalculating || !formData.pickupLocation.coordinates || !formData.dropoffLocation.coordinates}
                className="w-full md:w-auto"
              >
                {isCalculating ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    جاري الحساب...
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    حساب المسافة والتكلفة
                  </>
                )}
              </Button>
              
              <DistanceDisplay 
                distance={distance} 
                price={calculatedPrice} 
                isCalculating={isCalculating} 
              />
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
              disabled={submitting || !calculatedPrice}
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
