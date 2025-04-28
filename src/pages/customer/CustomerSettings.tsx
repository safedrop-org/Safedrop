
import { useState } from 'react';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Globe, Bell, Moon } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { toast } from 'sonner';

const CustomerSettingsContent = () => {
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState({
    orders: true,
    messages: true,
    earnings: true,
    updates: false
  });
  const [darkMode, setDarkMode] = useState(false);
  
  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleSave = () => {
    toast.success(t('settingsSaved'));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">{t('settings')}</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-safedrop-gold" />
                {t('languageSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">{t('preferredLanguage')}</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'ar' | 'en')}
                  className="w-full border rounded-md p-2"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-safedrop-gold" />
                {t('notificationSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('orderNotifications')}</p>
                  <p className="text-sm text-gray-500">{t('receiveOrderNotifications')}</p>
                </div>
                <Switch 
                  checked={notifications.orders}
                  onCheckedChange={(checked) => handleNotificationChange('orders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('messageNotifications')}</p>
                  <p className="text-sm text-gray-500">{t('receiveMessageNotifications')}</p>
                </div>
                <Switch 
                  checked={notifications.messages}
                  onCheckedChange={(checked) => handleNotificationChange('messages', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('earningsNotifications')}</p>
                  <p className="text-sm text-gray-500">{t('receiveEarningsNotifications')}</p>
                </div>
                <Switch 
                  checked={notifications.earnings}
                  onCheckedChange={(checked) => handleNotificationChange('earnings', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('systemNotifications')}</p>
                  <p className="text-sm text-gray-500">{t('receiveUpdateNotifications')}</p>
                </div>
                <Switch 
                  checked={notifications.updates}
                  onCheckedChange={(checked) => handleNotificationChange('updates', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-safedrop-gold" />
                {t('darkMode')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('darkMode')}</p>
                  <p className="text-sm text-gray-500">{t('enableDarkMode')}</p>
                </div>
                <Switch 
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              className="bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              {t('saveChanges')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

const CustomerSettings = () => {
  return (
    <LanguageProvider>
      <CustomerSettingsContent />
    </LanguageProvider>
  );
};

export default CustomerSettings;
