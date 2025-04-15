
import { useState } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { UserIcon, ShieldIcon, UploadIcon, CreditCardIcon } from 'lucide-react';
import { toast } from 'sonner';

const CustomerProfileContent = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'محمد',
    lastName: 'أحمد',
    email: 'mohammed@example.com',
    phone: '0512345678',
    address: 'الرياض، حي النخيل'
  });

  const [cardData, setCardData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
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
  
  const handleCardUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('تم تحديث بيانات الدفع بنجاح');
    }, 1000);
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
      <CustomerSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">الملف الشخصي</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 bg-white p-4 rounded-lg shadow flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="bg-safedrop-primary text-white text-xl">
                  {profileData.firstName[0]}{profileData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{profileData.firstName} {profileData.lastName}</h2>
                <p className="text-gray-500">{profileData.email}</p>
              </div>
            </div>
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="profile">
                  <UserIcon className="h-4 w-4 mr-2" />
                  البيانات الشخصية
                </TabsTrigger>
                <TabsTrigger value="payment">
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  طرق الدفع
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
                      
                      <div className="space-y-2">
                        <Label htmlFor="profileImage">الصورة الشخصية</Label>
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-safedrop-primary text-white text-xl">
                                {profileData.firstName[0]}{profileData.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1">
                            <div className="border border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center">
                              <UploadIcon className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">اسحب الصورة هنا أو انقر للتحميل</p>
                              <input 
                                type="file" 
                                className="hidden" 
                                id="profileImage" 
                                accept=".jpg,.jpeg,.png" 
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => document.getElementById('profileImage')?.click()}
                                className="mt-2"
                              >
                                اختر صورة
                              </Button>
                            </div>
                          </div>
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
              
              <TabsContent value="payment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>طرق الدفع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                            VISA
                          </div>
                          <div>
                            <p className="font-medium">بطاقة فيزا</p>
                            <p className="text-sm text-gray-500">تنتهي بـ **** 4582</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          حذف
                        </Button>
                      </div>
                    </div>
                    
                    <form onSubmit={handleCardUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardName">الاسم على البطاقة</Label>
                        <Input 
                          id="cardName" 
                          value={cardData.cardName}
                          onChange={(e) => setCardData({...cardData, cardName: e.target.value})}
                          placeholder="محمد أحمد"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">رقم البطاقة</Label>
                        <Input 
                          id="cardNumber" 
                          value={cardData.cardNumber}
                          onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                          placeholder="0000 0000 0000 0000"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">تاريخ الانتهاء</Label>
                          <Input 
                            id="expiry" 
                            value={cardData.expiry}
                            onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                            placeholder="MM/YY"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input 
                            id="cvv" 
                            value={cardData.cvv}
                            onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                            placeholder="123"
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="bg-safedrop-gold hover:bg-safedrop-gold/90 mt-4"
                        disabled={isLoading}
                      >
                        {isLoading ? 'جاري الإضافة...' : 'إضافة بطاقة'}
                      </Button>
                    </form>
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
                          <p className="font-medium">الإشعارات</p>
                          <p className="text-sm text-gray-500">إدارة إشعارات الأمان والتنبيهات</p>
                        </div>
                        <Button variant="outline">إدارة</Button>
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
const CustomerProfile = () => {
  return (
    <LanguageProvider>
      <CustomerProfileContent />
    </LanguageProvider>
  );
};

export default CustomerProfile;
