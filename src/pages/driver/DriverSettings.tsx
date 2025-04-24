
import { useState } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { Bell, Globe, Shield, Moon } from 'lucide-react';

const DriverSettingsContent = () => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState({
    orders: true,
    messages: true,
    earnings: true,
    updates: false
  });
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">الإعدادات</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  إعدادات الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">إشعارات الطلبات</p>
                      <p className="text-sm text-gray-500">استلام إشعارات عن الطلبات الجديدة</p>
                    </div>
                    <Switch 
                      checked={notifications.orders}
                      onCheckedChange={(checked) => setNotifications({...notifications, orders: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">إشعارات الرسائل</p>
                      <p className="text-sm text-gray-500">استلام إشعارات عن الرسائل الجديدة</p>
                    </div>
                    <Switch 
                      checked={notifications.messages}
                      onCheckedChange={(checked) => setNotifications({...notifications, messages: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">إشعارات الأرباح</p>
                      <p className="text-sm text-gray-500">استلام إشعارات عن الأرباح والمدفوعات</p>
                    </div>
                    <Switch 
                      checked={notifications.earnings}
                      onCheckedChange={(checked) => setNotifications({...notifications, earnings: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">إشعارات التحديثات</p>
                      <p className="text-sm text-gray-500">استلام إشعارات عن تحديثات النظام</p>
                    </div>
                    <Switch 
                      checked={notifications.updates}
                      onCheckedChange={(checked) => setNotifications({...notifications, updates: checked})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  إعدادات اللغة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">اللغة المفضلة</label>
                    <select className="w-full border rounded-md p-2">
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  الأمان والخصوصية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Button variant="outline" className="w-full">تغيير كلمة المرور</Button>
                  </div>
                  <div>
                    <Button variant="outline" className="w-full">تفعيل التحقق بخطوتين</Button>
                  </div>
                  <div>
                    <Button variant="outline" className="w-full">إدارة الأجهزة المتصلة</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  المظهر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">الوضع الليلي</p>
                    <p className="text-sm text-gray-500">تفعيل المظهر الداكن للتطبيق</p>
                  </div>
                  <Switch 
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="bg-safedrop-gold hover:bg-safedrop-gold/90">
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
      <DriverSettingsContent />
    </LanguageProvider>
  );
};

export default DriverSettings;
