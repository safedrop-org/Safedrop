
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';

const ProfileContent = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoggedIn || !user) {
        navigate('/login');
        return;
      }

      try {
        // Get auth user details
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          navigate('/login');
          return;
        }

        // Fetch profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setProfileData({
          firstName: profileData?.first_name || '',
          lastName: profileData?.last_name || '',
          email: authUser.email || '',
          phone: profileData?.phone || '',
          address: profileData?.address || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('حدث خطأ أثناء تحميل بيانات الملف الشخصي');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        throw new Error('User not authenticated');
      }

      // Update profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          address: profileData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id);

      if (error) throw error;

      toast.success('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('فشل تحديث الملف الشخصي');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CustomerSidebar />
        <main className="flex-1 p-6 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">الملف الشخصي</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block font-medium text-gray-700">الاسم الأول</label>
                <div className="relative">
                  <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleChange}
                    placeholder="الاسم الأول"
                    className="pr-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="lastName" className="block font-medium text-gray-700">اسم العائلة</label>
                <div className="relative">
                  <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleChange}
                    placeholder="اسم العائلة"
                    className="pr-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block font-medium text-gray-700">البريد الإلكتروني</label>
              <div className="relative">
                <MailIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  value={profileData.email}
                  readOnly
                  disabled
                  className="pr-10 bg-gray-50"
                />
              </div>
              <p className="text-sm text-gray-500">لا يمكن تغيير البريد الإلكتروني</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="block font-medium text-gray-700">رقم الهاتف</label>
              <div className="relative">
                <PhoneIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  placeholder="رقم الهاتف"
                  className="pr-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="address" className="block font-medium text-gray-700">العنوان</label>
              <div className="relative">
                <MapPinIcon className="absolute right-3 top-3 text-gray-400" />
                <Textarea
                  id="address"
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  placeholder="العنوان التفصيلي"
                  className="pr-10 min-h-[100px]"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="pt-4">
              <Button
                type="submit"
                className="bg-safedrop-gold hover:bg-safedrop-gold/90 w-full md:w-auto"
                disabled={isSaving}
              >
                {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

const Profile = () => {
  return (
    <LanguageProvider>
      <ProfileContent />
    </LanguageProvider>
  );
};

export default Profile;
