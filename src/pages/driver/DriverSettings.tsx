
import { useState } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const DriverSettingsContent = () => {
  const { t, language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    financialUpdates: true,
    promotions: false,
    appUpdates: true,
  });
  const [darkMode, setDarkMode] = useState(false);
  const [contactMethod, setContactMethod] = useState('email');

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">الإعدادات</h1>
              <SidebarTrigger />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto">
            {/* Account Settings Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>إعدادات الحساب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language Setting */}
                <div>
                  <h3 className="text-lg font-medium mb-3">اللغة</h3>
                  <RadioGroup 
                    defaultValue={language} 
                    onValueChange={(value) => setLanguage(value as 'ar' | 'en')}
                    className="flex space-x-3 rtl:space-x-reverse"
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="ar" id="ar" />
                      <Label htmlFor="ar">العربية</Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="en" id="en" />
                      <Label htmlFor="en">English</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Theme Setting */}
                <div>
                  <h3 className="text-lg font-medium mb-3">المظهر</h3>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Switch 
                      id="dark-mode" 
                      checked={darkMode} 
                      onCheckedChange={setDarkMode}
                    />
                    <Label htmlFor="dark-mode">الوضع المظلم</Label>
                  </div>
                </div>
                
                {/* Preferred Contact Method */}
                <div>
                  <h3 className="text-lg font-medium mb-3">طريقة التواصل المفضلة</h3>
                  <RadioGroup 
                    defaultValue={contactMethod} 
                    onValueChange={setContactMethod}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="email" id="email" />
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="sms" id="sms" />
                      <Label htmlFor="sms">الرسائل النصية</Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RadioGroupItem value="app" id="app" />
                      <Label htmlFor="app">إشعارات التطبيق فقط</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
            
            {/* Notifications Settings Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>إعدادات الإشعارات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">تحديثات الطلبات</p>
                    <p className="text-sm text-gray-500">استلام إشعارات عند وجود طلبات جديدة أو تغييرات في حالة الطلبات</p>
                  </div>
                  <Switch 
                    checked={notifications.orderUpdates} 
                    onCheckedChange={() => handleNotificationChange('orderUpdates')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">التحديثات المالية</p>
                    <p className="text-sm text-gray-500">إشعارات بخصوص المدفوعات والأرباح والتحويلات المالية</p>
                  </div>
                  <Switch 
                    checked={notifications.financialUpdates} 
                    onCheckedChange={() => handleNotificationChange('financialUpdates')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">العروض والترقيات</p>
                    <p className="text-sm text-gray-500">استلام معلومات عن العروض الترويجية والمزايا الخاصة</p>
                  </div>
                  <Switch 
                    checked={notifications.promotions} 
                    onCheckedChange={() => handleNotificationChange('promotions')} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">تحديثات التطبيق</p>
                    <p className="text-sm text-gray-500">إشعارات عن الميزات الجديدة وتحديثات التطبيق</p>
                  </div>
                  <Switch 
                    checked={notifications.appUpdates} 
                    onCheckedChange={() => handleNotificationChange('appUpdates')} 
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Privacy Settings Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>إعدادات الخصوصية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">مشاركة الموقع</p>
                    <p className="text-sm text-gray-500">السماح للتطبيق باستخدام موقعك الجغرافي لتحسين تجربة التوصيل</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">مشاركة البيانات التحليلية</p>
                    <p className="text-sm text-gray-500">المساعدة في تحسين التطبيق من خلال مشاركة بيانات الاستخدام المجهولة</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
            
            {/* Save Button */}
            <div className="flex justify-end">
              <Button className="bg-safedrop-primary hover:bg-safedrop-primary/90">
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverSettings = () => {
  return (
    <LanguageProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <DriverSettingsContent />
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
};

export default DriverSettings;
