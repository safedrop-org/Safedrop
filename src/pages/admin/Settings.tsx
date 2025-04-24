
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; 
import { toast } from "sonner";
import { Save, RefreshCcw, Languages } from "lucide-react";

const Settings = () => {
  // إعدادات العمولة
  const [commissionRate, setCommissionRate] = useState(15);
  
  // إعدادات اللغة
  const [enableArabic, setEnableArabic] = useState(true);
  const [enableEnglish, setEnableEnglish] = useState(true);
  const [defaultLanguage, setDefaultLanguage] = useState("ar");
  
  // الشروط والأحكام
  const [termsArabic, setTermsArabic] = useState("شروط استخدام المنصة باللغة العربية...");
  const [termsEnglish, setTermsEnglish] = useState("Platform terms of use in English...");
  const [privacyArabic, setPrivacyArabic] = useState("سياسة الخصوصية باللغة العربية...");
  const [privacyEnglish, setPrivacyEnglish] = useState("Privacy policy in English...");
  
  // إعدادات الإشعارات
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
  const [enableSmsNotifications, setEnableSmsNotifications] = useState(false);
  const [enablePushNotifications, setEnablePushNotifications] = useState(true);
  
  // حفظ الإعدادات
  const saveSettings = (section: string) => {
    toast.success(`تم حفظ إعدادات ${section} بنجاح`);
  };
  
  return (
    <div className="p-6 flex flex-col min-h-svh">
      <h1 className="text-2xl font-bold mb-6">إعدادات النظام</h1>
      
      <Tabs defaultValue="commission" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="commission">العمولة</TabsTrigger>
          <TabsTrigger value="language">اللغات</TabsTrigger>
          <TabsTrigger value="terms">الشروط والسياسات</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
        </TabsList>
        
        {/* إعدادات العمولة */}
        <TabsContent value="commission">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات العمولة</CardTitle>
              <CardDescription>تعديل نسبة العمولة المستقطعة من الطلبات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="commission-rate">نسبة العمولة (%)</Label>
                <div className="flex gap-4">
                  <Input 
                    id="commission-rate"
                    type="number"
                    min="0"
                    max="100"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="max-w-[200px]"
                  />
                  <Button onClick={() => setCommissionRate(15)} variant="outline" className="gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    إعادة تعيين
                  </Button>
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => saveSettings("العمولة")} className="gap-2">
                  <Save className="h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* إعدادات اللغة */}
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات اللغة</CardTitle>
              <CardDescription>تفعيل وتعطيل اللغات المتاحة في التطبيق</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Languages className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="enable-arabic">اللغة العربية</Label>
                      <p className="text-sm text-gray-500">تفعيل اللغة العربية في التطبيق</p>
                    </div>
                  </div>
                  <Switch 
                    id="enable-arabic" 
                    checked={enableArabic} 
                    onCheckedChange={setEnableArabic}
                    disabled={!enableEnglish}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Languages className="h-5 w-5 text-gray-500" />
                    <div>
                      <Label htmlFor="enable-english">اللغة الإنجليزية</Label>
                      <p className="text-sm text-gray-500">تفعيل اللغة الإنجليزية في التطبيق</p>
                    </div>
                  </div>
                  <Switch 
                    id="enable-english" 
                    checked={enableEnglish} 
                    onCheckedChange={setEnableEnglish}
                    disabled={!enableArabic}
                  />
                </div>
                
                <div className="space-y-2 pt-2">
                  <Label htmlFor="default-language">اللغة الافتراضية</Label>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <Button
                      type="button"
                      variant={defaultLanguage === "ar" ? "default" : "outline"}
                      onClick={() => setDefaultLanguage("ar")}
                      disabled={!enableArabic}
                    >
                      العربية (ع)
                    </Button>
                    <Button
                      type="button"
                      variant={defaultLanguage === "en" ? "default" : "outline"}
                      onClick={() => setDefaultLanguage("en")}
                      disabled={!enableEnglish}
                    >
                      English (EN)
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => saveSettings("اللغة")} className="gap-2">
                  <Save className="h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* إعدادات الشروط والسياسات */}
        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle>الشروط والأحكام وسياسة الخصوصية</CardTitle>
              <CardDescription>تعديل شروط الاستخدام وسياسة الخصوصية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="terms-arabic">شروط الاستخدام (العربية)</Label>
                <Textarea 
                  id="terms-arabic" 
                  rows={5} 
                  value={termsArabic}
                  onChange={(e) => setTermsArabic(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="terms-english">شروط الاستخدام (الإنجليزية)</Label>
                <Textarea 
                  id="terms-english" 
                  rows={5} 
                  value={termsEnglish}
                  onChange={(e) => setTermsEnglish(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="privacy-arabic">سياسة الخصوصية (العربية)</Label>
                <Textarea 
                  id="privacy-arabic" 
                  rows={5} 
                  value={privacyArabic}
                  onChange={(e) => setPrivacyArabic(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="privacy-english">سياسة الخصوصية (الإنجليزية)</Label>
                <Textarea 
                  id="privacy-english" 
                  rows={5} 
                  value={privacyEnglish}
                  onChange={(e) => setPrivacyEnglish(e.target.value)}
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={() => saveSettings("الشروط والسياسات")} className="gap-2">
                  <Save className="h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* إعدادات الإشعارات */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
              <CardDescription>تكوين إعدادات الإشعارات للمستخدمين</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">إشعارات البريد الإلكتروني</Label>
                    <p className="text-sm text-gray-500">تفعيل إرسال الإشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={enableEmailNotifications} 
                    onCheckedChange={setEnableEmailNotifications} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications">إشعارات الرسائل النصية</Label>
                    <p className="text-sm text-gray-500">تفعيل إرسال الإشعارات عبر الرسائل النصية</p>
                  </div>
                  <Switch 
                    id="sms-notifications" 
                    checked={enableSmsNotifications} 
                    onCheckedChange={setEnableSmsNotifications} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">الإشعارات الفورية</Label>
                    <p className="text-sm text-gray-500">تفعيل الإشعارات الفورية في التطبيق</p>
                  </div>
                  <Switch 
                    id="push-notifications" 
                    checked={enablePushNotifications} 
                    onCheckedChange={setEnablePushNotifications} 
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => saveSettings("الإشعارات")} className="gap-2">
                  <Save className="h-4 w-4" />
                  حفظ الإعدادات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
