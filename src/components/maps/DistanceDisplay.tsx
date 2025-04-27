
import React from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

interface DistanceDisplayProps {
  distance: number | null;
  price: number | null;
  isCalculating: boolean;
}

const DistanceDisplay: React.FC<DistanceDisplayProps> = ({ 
  distance, 
  price, 
  isCalculating 
}) => {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold flex items-center">
          <Navigation className="h-5 w-5 ml-2 text-safedrop-gold" />
          تفاصيل المسار والتكلفة
        </h3>

        {isCalculating ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-safedrop-primary"></div>
            <span className="mr-2">جاري الحساب...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {distance !== null ? (
              <div className="bg-gray-100 p-3 rounded-md">
                <span className="text-sm text-gray-500">المسافة:</span>
                <p className="font-semibold text-safedrop-primary">{distance.toFixed(2)} كم</p>
              </div>
            ) : null}
            
            {price !== null ? (
              <div className="bg-gray-100 p-3 rounded-md">
                <span className="text-sm text-gray-500">السعر المتوقع:</span>
                <p className="font-semibold text-safedrop-primary">{price.toFixed(2)} ريال</p>
              </div>
            ) : null}

            {distance === null && price === null && !isCalculating && (
              <div className="col-span-2 text-center py-4 text-gray-500 flex flex-col items-center">
                <AlertCircle className="h-6 w-6 mb-2 text-amber-500" />
                <p>أدخل موقع الاستلام والتوصيل لحساب التكلفة</p>
              </div>
            )}
          </div>
        )}

        {price !== null && (
          <div className="mt-2 text-sm text-gray-600">
            <ul className="list-disc list-inside">
              <li>10 ريال كحد أدنى ثابت لكل طلب</li>
              <li>1.5 ريال لكل كيلومتر إضافي بعد أول 2 كيلومتر</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DistanceDisplay;
