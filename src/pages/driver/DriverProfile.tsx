
import { useState } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { UserIcon, FileTextIcon, ShieldIcon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';

const DriverProfileContent = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'أحمد',
    lastName: 'محمد',
    email: 'ahmed@example.com',
    phone: '0512345678',
    address: 'الرياض، حي الملقا'
  });
  
  const [documentData, setDocumentData] = useState({
    nationalId: '1234567890',
    licenseNumber: 'DL12345678',
    nationalIdExpiry: '2026-05-15',
    licenseExpiry: '2027-03-20'
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('تم تحديث البيانات الشخصية بنجاح');
    }, 1000);
  };

  const handleDocumentUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('تم رفع الوثائق بنجاح، وسيتم مراجعتها');
    }, 1500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('تم تغيير كلمة المرور بنجاح');
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">الملف الشخصي</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="profile">
                  <UserIcon className="h-4 w-4 mr-2" />
                  البيانات الشخصية
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  الوثائق والمستندات
                </TabsTrigger>
                <TabsTrigger value="security">
                  <ShieldIcon className="h-4 w-4 mr-2" />
                  الأمان
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>البيانات الشخصية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">الاسم الأول</Label>
                          <Input 
                            id="firstName" 
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">اسم العائلة</Label>
                          <Input 
                            id="lastName" 
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">البريد الإلكتروني</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">رقم الهاتف</Label>
                          <Input 
                            id="phone" 
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">العنوان</Label>
                          <Input 
                            id="address" 
                            value={profileData.address}
                            onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="bg-safedrop-gold hover:bg-safedrop-gold/90 mt-4"
                        disabled={isLoading}
                      >
                        {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>الوثائق والمستندات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDocumentUpload} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nationalId">رقم الهوية الوطنية</Label>
                          <Input 
                            id="nationalId" 
                            value={documentData.nationalId}
                            onChange={(e) => setDocumentData({...documentData, nationalId: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nationalIdExpiry">تاريخ انتهاء الهوية</Label>
                          <Input 
                            id="nationalIdExpiry" 
                            type="date" 
                            value={documentData.nationalIdExpiry}
                            onChange={(e) => setDocumentData({...documentData, nationalIdExpiry: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="licenseNumber">رقم رخصة القيادة</Label>
                          <Input 
                            id="licenseNumber" 
                            value={documentData.licenseNumber}
                            onChange={(e) => setDocumentData({...documentData, licenseNumber: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="licenseExpiry">تاريخ انتهاء الرخصة</Label>
                          <Input 
                            id="licenseExpiry" 
                            type="date" 
                            value={documentData.licenseExpiry}
                            onChange={(e) => setDocumentData({...documentData, licenseExpiry: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4 mt-6">
                        <div>
                          <Label className="block mb-2">صورة الهوية الوطنية</Label>
                          <div className="flex items-center gap-2">
                            <div className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center w-full">
                              <UploadIcon className="h-10 w-10 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">اسحب الملف هنا أو انقر للتحميل</p>
                              <input 
                                type="file" 
                                className="hidden" 
                                id="nationalIdFile" 
                                accept=".jpg,.jpeg,.png,.pdf" 
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => document.getElementById('nationalIdFile')?.click()}
                                className="mt-2"
                              >
                                اختر ملف
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">الصيغ المدعومة: JPG, JPEG, PNG, PDF</p>
                        </div>
                        
                        <div>
                          <Label className="block mb-2">صورة رخصة القيادة</Label>
                          <div className="flex items-center gap-2">
                            <div className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center w-full">
                              <UploadIcon className="h-10 w-10 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">اسحب الملف هنا أو انقر للتحميل</p>
                              <input 
                                type="file" 
                                className="hidden" 
                                id="licenseFile" 
                                accept=".jpg,.jpeg,.png,.pdf" 
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => document.getElementById('licenseFile')?.click()}
                                className="mt-2"
                              >
                                اختر ملف
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">الصيغ المدعومة: JPG, JPEG, PNG, PDF</p>
                        </div>
                        
                        <div>
                          <Label className="block mb-2">شهادة حسن السيرة والسلوك (اختياري)</Label>
                          <div className="flex items-center gap-2">
                            <div className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center w-full">
                              <UploadIcon className="h-10 w-10 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">اسحب الملف هنا أو انقر للتحميل</p>
                              <input 
                                type="file" 
                                className="hidden" 
                                id="goodConductFile" 
                                accept=".jpg,.jpeg,.png,.pdf" 
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => document.getElementById('goodConductFile')?.click()}
                                className="mt-2"
                              >
                                اختر ملف
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">الصيغ المدعومة: JPG, JPEG, PNG, PDF</p>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="bg-safedrop-gold hover:bg-safedrop-gold/90 mt-6"
                        disabled={isLoading}
                      >
                        {isLoading ? 'جاري رفع الوثائق...' : 'رفع الوثائق'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>حالة الوثائق</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-md border border-green-200">
                        <div className="flex items-center gap-2">
                          <ShieldIcon className="h-5 w-5 text-green-600" />
                          <span>الهوية الوطنية</span>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">تمت الموافقة</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-md border border-green-200">
                        <div className="flex items-center gap-2">
                          <ShieldIcon className="h-5 w-5 text-green-600" />
                          <span>رخصة القيادة</span>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">تمت الموافقة</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-md border border-yellow-200">
                        <div className="flex items-center gap-2">
                          <ShieldIcon className="h-5 w-5 text-yellow-600" />
                          <span>شهادة حسن السيرة والسلوك</span>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">غير مرفقة</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>تغيير كلمة المرور</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                      <Button 
                        type="submit" 
                        className="bg-safedrop-gold hover:bg-safedrop-gold/90 mt-4"
                        disabled={isLoading}
                      >
                        {isLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>أمان الحساب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">التحقق بخطوتين</p>
                          <p className="text-sm text-gray-500">تفعيل التحقق بخطوتين لتعزيز أمان حسابك</p>
                        </div>
                        <Button variant="outline">تفعيل</Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">سجل تسجيل الدخول</p>
                          <p className="text-sm text-gray-500">عرض سجل عمليات تسجيل الدخول الأخيرة</p>
                        </div>
                        <Button variant="outline">عرض السجل</Button>
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
const DriverProfile = () => {
  return (
    <LanguageProvider>
      <DriverProfileContent />
    </LanguageProvider>
  );
};

export default DriverProfile;
