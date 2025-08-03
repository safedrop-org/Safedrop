
import React from 'react';
import { useProfile } from '@/hooks/useProfile';
import CustomerPageLayout from '@/components/customer/CustomerPageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/ui/language-context';

const CustomerProfileContent = () => {
  const { data: profile, isLoading } = useProfile();
  const { user } = useAuth();
  const [saving, setSaving] = React.useState(false);
  const { t } = useLanguage();
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      toast({
        title: t('profileUpdatedSuccessfully'),
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('errorUpdatingProfile'),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <CustomerPageLayout
      title={t('profile')}
      loading={isLoading}
      headerActions={
        <Button 
          form="profile-form"
          type="submit" 
          className="w-full sm:w-auto"
          disabled={saving}
        >
          {saving ? t('savingChanges') : t('saveChanges')}
        </Button>
      }
    >
      <div className="max-w-2xl bg-white rounded-lg shadow p-6">
        <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-700">
                {t('firstName')}
              </label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-700">
                {t('lastName')}
              </label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700">
              {t('phone')}
            </label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full"
              dir="ltr"
            />
          </div>
        </form>
      </div>
    </CustomerPageLayout>
  );
};

const CustomerProfile = () => {
  return <CustomerProfileContent />;
};

export default CustomerProfile;
