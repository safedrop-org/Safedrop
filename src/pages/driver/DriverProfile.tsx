import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/components/ui/use-toast';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ImageIcon, User2 } from 'lucide-react';

const DriverProfileContent = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    city: '',
    national_id: '',
    license_number: '',
    license_expiry: '',
    national_id_expiry: '',
    iban: '',
    bank_name: '',
    profile_image_url: '',
  });
  const [tempProfileImage, setTempProfileImage] = useState<string | null>(null);
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);

  const { data: initialProfileData, isLoading, error, mutate } = useProfile();

  useEffect(() => {
    if (initialProfileData) {
      setProfileData({
        ...initialProfileData,
        license_expiry: initialProfileData.license_expiry || '',
        national_id_expiry: initialProfileData.national_id_expiry || '',
        profile_image_url: initialProfileData.profile_image_url || '',
      });
    }
  }, [initialProfileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) {
        toast({
          title: "Error",
          description: "User ID not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const updates = {
        ...profileData,
        id: user.id,
      };

      if (newProfileImage) {
        const { data, error: storageError } = await supabase.storage
          .from('avatars')
          .upload(`${user.id}/${newProfileImage.name}`, newProfileImage, {
            cacheControl: '3600',
            upsert: false
          });

        if (storageError) {
          console.error("Error uploading image:", storageError);
          toast({
            title: "Error",
            description: "Failed to upload profile image.",
            variant: "destructive",
          });
          return;
        }

        const profile_image_url = `${supabase.storageUrl}/avatars/${data?.path}`;
        updates.profile_image_url = profile_image_url;
      }

      await mutate(updates);

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-safedrop-primary mx-auto"></div>
          <h2 className="text-2xl font-bold">{t('loading') || 'جاري التحميل...'}</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <ImageIcon className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">Error Loading Data</h2>
          <p className="text-gray-600">Failed to load profile data. Please try again.</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">الملف الشخصي</h1>
              <SidebarTrigger />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="personal">المعلومات الشخصية</TabsTrigger>
                <TabsTrigger value="documents">الوثائق</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isEditing ? 'تعديل المعلومات الشخصية' : 'معلوماتك الشخصية'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center mb-4">
                      <Avatar className="h-24 w-24">
                        {tempProfileImage ? (
                          <AvatarImage src={tempProfileImage} alt="Profile" />
                        ) : profileData.profile_image_url ? (
                          <AvatarImage src={profileData.profile_image_url} alt="Profile" />
                        ) : (
                          <AvatarFallback><User2 className="h-8 w-8" /></AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    {isEditing && (
                      <div className="flex justify-center">
                        <label htmlFor="profile-image-upload" className="cursor-pointer">
                          <Input
                            type="file"
                            id="profile-image-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                          <Button variant="secondary" size="sm">
                            تغيير الصورة
                          </Button>
                        </label>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">الاسم الكامل</Label>
                        <Input
                          type="text"
                          id="full_name"
                          name="full_name"
                          value={profileData.full_name}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone_number">رقم الهاتف</Label>
                        <Input
                          type="tel"
                          id="phone_number"
                          name="phone_number"
                          value={profileData.phone_number}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">المدينة</Label>
                        <Input
                          type="text"
                          id="city"
                          name="city"
                          value={profileData.city}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات الوثائق</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="national_id">رقم الهوية الوطنية</Label>
                        <Input
                          type="text"
                          id="national_id"
                          name="national_id"
                          value={profileData.national_id}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="national_id_expiry">تاريخ انتهاء الهوية الوطنية</Label>
                        <Input
                          type="date"
                          id="national_id_expiry"
                          name="national_id_expiry"
                          value={profileData.national_id_expiry}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="license_number">رقم رخصة القيادة</Label>
                        <Input
                          type="text"
                          id="license_number"
                          name="license_number"
                          value={profileData.license_number}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="license_expiry">تاريخ انتهاء رخصة القيادة</Label>
                        <Input
                          type="date"
                          id="license_expiry"
                          name="license_expiry"
                          value={profileData.license_expiry}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>المعلومات المالية</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="iban">رقم الحساب المصرفي (IBAN)</Label>
                        <Input
                          type="text"
                          id="iban"
                          name="iban"
                          value={profileData.iban}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bank_name">اسم البنك</Label>
                        <Input
                          type="text"
                          id="bank_name"
                          name="bank_name"
                          value={profileData.bank_name}
                          onChange={handleChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end mt-4">
              {isEditing ? (
                <div className="space-x-2">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleSubmit} className="bg-safedrop-primary hover:bg-safedrop-primary/90">
                    حفظ التغييرات
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="bg-safedrop-primary hover:bg-safedrop-primary/90">
                  تعديل الملف الشخصي
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverProfile = () => {
  return (
    <LanguageProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <DriverProfileContent />
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
};

export default DriverProfile;
