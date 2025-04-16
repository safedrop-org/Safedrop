import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { LogOutIcon, Save, Languages, Percent, RefreshCcw, FileText, UserCog, ShieldAlert, Globe } from 'lucide-react';
import { toast } from 'sonner';

const SettingsContent = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Commission Settings - Now fixed at 15%
  const commissionRate = 15; // Fixed at 15%
  const [minOrderValue, setMinOrderValue] = useState(50);
  const [maxDistance, setMaxDistance] = useState(30);
  
  // Terms and Policies
  const [termsArabic, setTermsArabic] = useState('شروط الاستخدام باللغة العربية...');
  const [termsEnglish, setTermsEnglish] = useState('Terms of Service in English...');
  const [privacyArabic, setPrivacyArabic] = useState('سياسة الخصوصية باللغة العربية...');
  const [privacyEnglish, setPrivacyEnglish] = useState('Privacy Policy in English...');
  
  // User Settings
  const [requireVerification, setRequireVerification] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [customerCanRate, setCustomerCanRate] = useState(true);
  
  // System Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState('ar');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState('admin@safedrop.com');

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth || adminAuth !== 'true') {
      navigate('/admin');
    } else {
      setIsAdmin(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // In a real app, this would call an API to save the settings
    setTimeout(() => {
      toast.success('تم حفظ الإعدادات بنجاح');
      setIsSaving(false);
    }, 1000);
  };

  const handleResetSettings = () => {
    // Reset settings except commission rate which is fixed
    setMinOrderValue(50);
    setMaxDistance(30);
    setRequireVerification(true);
    setAutoApprove(false);
    setCustomerCanRate(true);
    setMaintenanceMode(false);
    setDefaultLanguage('ar');
    setEnableNotifications(true);
    setNotificationEmail('admin@safedrop.com');
    
    toast.success('تم إعادة ضبط الإعدادات إلى القيم الافتراضية');
  };

  if (!isAdmin) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">إعدادات النظام</h1>
            <Button variant="outline" className="gap-2" onClick={handleLogout}>
              <LogOutIcon className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-end mb-6 gap-3">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleResetSettings}
              >
                <RefreshCcw className="h-4 w-4" />
                إعادة ضبط
              </Button>
              
              <Button 
                variant="default" 
                className="gap-2"
                onClick={handleSaveSettings}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="animate-spin">
                    <RefreshCcw className="h-4 w-4" />
                  </span>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                حفظ الإعدادات
              </Button>
            </div>
            
            <Tabs defaultValue="commission" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-6">
                <TabsTrigger value="commission">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    <span>العمولة</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="terms">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>الشروط والأحكام</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="users">
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    <span>إعدادات المستخدمين</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="system">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    <span>النظام</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="commission" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Percent className="h-5 w-5" />
                      إعدادات العمولة والأسعار
                    </CardTitle>
                    <CardDescription>
                      تحكم في حدود الخدمة (عمولة المنصة ثابتة 15%)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="commission-rate">نسبة العمولة (ثابتة)</Label>
                        <span className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded">{commissionRate}%</span>
                      </div>
                      <p className="text-sm text-gray-500">نسبة العمولة التي سيتم خصمها من كل طلب (قيمة ثابتة لا يمكن تغييرها).</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="min-order-value">الحد الأدنى لقيمة الطلب</Label>
                        <div className="relative">
                          <Input
                            id="min-order-value"
                            type="number"
                            value={minOrderValue}
                            onChange={(e) => setMinOrderValue(Number(e.target.value))}
                            className="pl-14"
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none px-3 border-r">
                            <span className="text-gray-500">ر.س</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="max-distance">الحد الأقصى للمسافة</Label>
                        <div className="relative">
                          <Input
                            id="max-distance"
                            type="number"
                            value={maxDistance}
                            onChange={(e) => setMaxDistance(Number(e.target.value))}
                            className="pl-12"
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none px-3 border-r">
                            <span className="text-gray-500">كم</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="terms" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      شروط الاستخدام
                    </CardTitle>
                    <CardDescription>
                      تعديل شروط الاستخدام في التطبيق
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="terms-arabic">الشروط والأحكام (العربية)</Label>
                        <Globe className="h-4 w-4" />
                      </div>
                      <Textarea
                        id="terms-arabic"
                        value={termsArabic}
                        onChange={(e) => setTermsArabic(e.target.value)}
                        className="min-h-[200px] resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="terms-english">Terms and Conditions (English)</Label>
                        <Globe className="h-4 w-4" />
                      </div>
                      <Textarea
                        id="terms-english"
                        value={termsEnglish}
                        onChange={(e) => setTermsEnglish(e.target.value)}
                        className="min-h-[200px] resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5" />
                      سياسة الخصوصية
                    </CardTitle>
                    <CardDescription>
                      تعديل سياسة الخصوصية في التطبيق
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="privacy-arabic">سياسة الخصوصية (العربية)</Label>
                        <Globe className="h-4 w-4" />
                      </div>
                      <Textarea
                        id="privacy-arabic"
                        value={privacyArabic}
                        onChange={(e) => setPrivacyArabic(e.target.value)}
                        className="min-h-[200px] resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="privacy-english">Privacy Policy (English)</Label>
                        <Globe className="h-4 w-4" />
                      </div>
                      <Textarea
                        id="privacy-english"
                        value={privacyEnglish}
                        onChange={(e) => setPrivacyEnglish(e.target.value)}
                        className="min-h-[200px] resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCog className="h-5 w-5" />
                      إعدادات المستخدمين
                    </CardTitle>
                    <CardDescription>
                      تحكم في طريقة تس��يل وتفاعل المستخدمين
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="require-verification">طلب توثيق السائقين</Label>
                        <p className="text-sm text-gray-500">يتطلب تقديم وثائق تحقق الهوية من السائقين قبل الموافقة</p>
                      </div>
                      <Switch
                        id="require-verification"
                        checked={requireVerification}
                        onCheckedChange={setRequireVerification}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-approve">الموافقة التلقائية على طلبات العملاء</Label>
                        <p className="text-sm text-gray-500">الموافقة تلقائياً على طلبات تسجيل العملاء دون مراجعة يدوية</p>
                      </div>
                      <Switch
                        id="auto-approve"
                        checked={autoApprove}
                        onCheckedChange={setAutoApprove}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="customer-rate">يمكن للعملاء تقييم السائقين</Label>
                        <p className="text-sm text-gray-500">السماح للعملاء بتقييم السائقين بعد توصيل الطلب</p>
                      </div>
                      <Switch
                        id="customer-rate"
                        checked={customerCanRate}
                        onCheckedChange={setCustomerCanRate}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="system" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5" />
                      إعدادات النظام
                    </CardTitle>
                    <CardDescription>
                      الإعدادات العامة للنظام واللغة
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="maintenance-mode">وضع الصيانة</Label>
                        <p className="text-sm text-gray-500">تفعيل وضع الصيانة وإيقاف الوصول للتطبيق مؤقتاً</p>
                      </div>
                      <Switch
                        id="maintenance-mode"
                        checked={maintenanceMode}
                        onCheckedChange={setMaintenanceMode}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="default-language">اللغة الافتراضية</Label>
                      <div className="flex items-center gap-2">
                        <Languages className="h-5 w-5 text-gray-500" />
                        <RadioGroup
                          id="default-language"
                          value={defaultLanguage}
                          onValueChange={setDefaultLanguage}
                          className="flex gap-4"
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
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">تفعيل الإشعارات</Label>
                        <p className="text-sm text-gray-500">إرسال إشعارات للمشرفين عند وجود طلبات جديدة أو شكاوى</p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={enableNotifications}
                        onCheckedChange={setEnableNotifications}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notification-email">بريد الإشعارات</Label>
                      <Input
                        id="notification-email"
                        type="email"
                        value={notificationEmail}
                        onChange={(e) => setNotificationEmail(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات النظام</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">إصدار النظام:</p>
                        <p className="font-medium">1.0.0</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">تاريخ آخر تحديث:</p>
                        <p className="font-medium">2025-04-16</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">المطور:</p>
                        <p className="font-medium">شركة سيف دروب</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">حالة النظام:</p>
                        <div className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                          <span className="font-medium">نشط</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

// Wrap the component with LanguageProvider
const Settings = () => {
  return (
    <LanguageProvider>
      <SettingsContent />
    </LanguageProvider>
  );
};

export default Settings;
