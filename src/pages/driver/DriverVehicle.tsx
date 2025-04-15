
import { useState } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { TruckIcon, UploadIcon, CheckCircleIcon } from 'lucide-react';
import { toast } from 'sonner';

const DriverVehicleContent = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    make: 'تويوتا',
    model: 'كامري',
    year: '2020',
    color: 'أبيض',
    plateNumber: 'ABC 1234',
    insuranceNumber: 'INS-123456789',
    insuranceExpiry: '2025-12-31'
  });

  const handleVehicleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('تم تحديث بيانات المركبة بنجاح');
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">مركبتي</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 bg-white rounded-lg shadow">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 rounded-full p-3">
                    <TruckIcon className="h-8 w-8 text-safedrop-gold" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{vehicleData.make} {vehicleData.model} {vehicleData.year}</h2>
                    <p className="text-gray-500">{vehicleData.plateNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">مفعلة</span>
                </div>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>بيانات المركبة</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVehicleUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">الشركة المصنعة</Label>
                      <Input 
                        id="make" 
                        value={vehicleData.make}
                        onChange={(e) => setVehicleData({...vehicleData, make: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">الموديل</Label>
                      <Input 
                        id="model" 
                        value={vehicleData.model}
                        onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">سنة الصنع</Label>
                      <Input 
                        id="year" 
                        value={vehicleData.year}
                        onChange={(e) => setVehicleData({...vehicleData, year: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">اللون</Label>
                      <Input 
                        id="color" 
                        value={vehicleData.color}
                        onChange={(e) => setVehicleData({...vehicleData, color: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plateNumber">رقم اللوحة</Label>
                      <Input 
                        id="plateNumber" 
                        value={vehicleData.plateNumber}
                        onChange={(e) => setVehicleData({...vehicleData, plateNumber: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insuranceNumber">رقم وثيقة التأمين</Label>
                      <Input 
                        id="insuranceNumber" 
                        value={vehicleData.insuranceNumber}
                        onChange={(e) => setVehicleData({...vehicleData, insuranceNumber: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insuranceExpiry">تاريخ انتهاء التأمين</Label>
                      <Input 
                        id="insuranceExpiry" 
                        type="date"
                        value={vehicleData.insuranceExpiry}
                        onChange={(e) => setVehicleData({...vehicleData, insuranceExpiry: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-2">
                      <Label className="block mb-2">صورة المركبة</Label>
                      <div className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                        <UploadIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">اسحب الصورة هنا أو انقر للتحميل</p>
                        <input 
                          type="file" 
                          className="hidden" 
                          id="vehicleImage" 
                          accept=".jpg,.jpeg,.png" 
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('vehicleImage')?.click()}
                          className="mt-2"
                        >
                          اختر صورة
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">صورة واضحة للمركبة من الأمام والجانب</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="block mb-2">صورة استمارة المركبة</Label>
                      <div className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                        <UploadIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">اسحب الملف هنا أو انقر للتحميل</p>
                        <input 
                          type="file" 
                          className="hidden" 
                          id="registrationDoc" 
                          accept=".jpg,.jpeg,.png,.pdf" 
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('registrationDoc')?.click()}
                          className="mt-2"
                        >
                          اختر ملف
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">صورة واضحة للاستمارة سارية المفعول</p>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="bg-safedrop-gold hover:bg-safedrop-gold/90 mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>سجل الصيانة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div>
                      <p className="font-medium">صيانة دورية</p>
                      <p className="text-sm text-gray-500">تاريخ: 2025-03-15</p>
                    </div>
                    <Button variant="outline" size="sm">عرض التفاصيل</Button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div>
                      <p className="font-medium">تغيير زيت وفلتر</p>
                      <p className="text-sm text-gray-500">تاريخ: 2025-02-10</p>
                    </div>
                    <Button variant="outline" size="sm">عرض التفاصيل</Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                  >
                    إضافة سجل صيانة جديد
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

// Wrap the component with LanguageProvider
const DriverVehicle = () => {
  return (
    <LanguageProvider>
      <DriverVehicleContent />
    </LanguageProvider>
  );
};

export default DriverVehicle;
