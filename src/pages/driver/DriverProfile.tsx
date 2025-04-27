
import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const DriverProfileContent = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle_model: '',
    vehicle_year: '',
    license_number: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');

  const { data: profileData, isLoading, error, refetch } = useQuery({
    queryKey: ['driver-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('drivers')
        .select('*, profiles(*)')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.profiles?.full_name || '',
        email: profileData.profiles?.email || '',
        phone: profileData.phone || '',
        vehicle_model: profileData.vehicle_model || '',
        vehicle_year: profileData.vehicle_year || '',
        license_number: profileData.license_number || '',
      });

      if (profileData.profiles?.avatar_url) {
        setAvatarUrl(profileData.profiles.avatar_url);
      }
    }
  }, [profileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير جداً",
          description: "يرجى اختيار صورة بحجم أقل من 2 ميجابايت",
          variant: "destructive",
        });
        return;
      }
      setAvatar(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update profile information
      const profileUpdates = {
        phone: formData.phone,
        vehicle_model: formData.vehicle_model,
        vehicle_year: formData.vehicle_year,
        license_number: formData.license_number,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from('drivers')
        .update(profileUpdates)
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Upload avatar if changed
      if (avatar) {
        const filePath = `avatars/${user?.id}/${Date.now()}-${avatar.name}`;
        
        const { error: uploadError } = await supabase
          .storage
          .from('profiles')
          .upload(filePath, avatar);

        if (uploadError) throw uploadError;

        const { data } = await supabase
          .storage
          .from('profiles')
          .getPublicUrl(filePath);

        // Update avatar URL in the profile
        const { error: avatarError } = await supabase
          .from('profiles')
          .update({ avatar_url: data.publicUrl })
          .eq('id', user?.id);

        if (avatarError) throw avatarError;
      }

      toast({
        title: "تم تحديث الملف الشخصي بنجاح",
        variant: "default",
        className: "bg-green-500 text-white",
      });

      // Refresh data
      refetch();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "فشل تحديث الملف الشخصي",
        description: "حدث خطأ أثناء تحديث البيانات",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="max-w-3xl mx-auto space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="p-4 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safedrop-primary"></div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="p-4">
                  <div className="text-red-500">حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.</div>
                  <Button onClick={() => refetch()} className="mt-2">إعادة المحاولة</Button>
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handleSubmit}>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Avatar Section */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-gray-200">
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt="Profile" 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                              <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <Input
                            type="file"
                            id="avatar"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label 
                            htmlFor="avatar" 
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            تغيير الصورة
                          </label>
                        </div>
                      </div>
                      
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                          <Input 
                            type="text" 
                            id="name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            disabled
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                          <Input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            disabled
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال</label>
                          <Input 
                            type="tel" 
                            id="phone" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      
                      {/* Vehicle Information */}
                      <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-medium mb-4">معلومات المركبة</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="vehicle_model" className="block text-sm font-medium text-gray-700 mb-1">طراز المركبة</label>
                            <Input 
                              type="text" 
                              id="vehicle_model" 
                              name="vehicle_model" 
                              value={formData.vehicle_model} 
                              onChange={handleChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="vehicle_year" className="block text-sm font-medium text-gray-700 mb-1">سنة الصنع</label>
                            <Input 
                              type="text" 
                              id="vehicle_year" 
                              name="vehicle_year" 
                              value={formData.vehicle_year} 
                              onChange={handleChange}
                            />
                          </div>
                          <div>
                            <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-1">رقم رخصة القيادة</label>
                            <Input 
                              type="text" 
                              id="license_number" 
                              name="license_number" 
                              value={formData.license_number} 
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-6">
                        <Button 
                          type="submit" 
                          className="bg-safedrop-primary hover:bg-safedrop-primary/90"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </form>
            )}
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
