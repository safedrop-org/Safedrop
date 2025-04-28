import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { useNavigate, Link } from 'react-router-dom';
import { UserIcon, LockIcon, MailIcon, PhoneIcon, CheckCircle2 } from 'lucide-react';

const customerRegisterSchema = z.object({
  firstName: z.string().min(2, {
    message: "الاسم الأول مطلوب"
  }),
  lastName: z.string().min(2, {
    message: "اسم العائلة مطلوب"
  }),
  email: z.string().email({
    message: "البريد الإلكتروني غير صالح"
  }),
  phone: z.string().min(10, {
    message: "رقم الهاتف غير صالح"
  }),
  password: z.string().min(8, {
    message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
  })
});
type CustomerFormValues = z.infer<typeof customerRegisterSchema>;

const CustomerRegisterContent = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerRegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: ''
    }
  });

  const onSubmit = async (data: CustomerFormValues) => {
    setIsLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            user_type: 'customer'
          },
          emailRedirectTo: window.location.origin + '/customer/dashboard'
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      // Create profile record
      const { error: profileError } = await supabase.from('profiles').insert({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        user_type: 'customer'
      });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        toast.error(t('registrationError'));
        setIsLoading(false);
        return;
      }

      // Show success message and redirect to login
      toast.success(t('registrationSuccess'), {
        description: t('checkEmailConfirmation')
      });
      navigate('/login');
    } catch (error: any) {
      toast.error(t('registrationError'), {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8">
        <div className="text-center">
          <img alt="SafeDrop Logo" className="mx-auto h-20 w-auto mb-4" src="/lovable-uploads/abbaa84d-9220-43c2-833e-afb017f5a986.png" />
          <h2 className="text-3xl font-bold text-safedrop-primary">
            {t('customerRegister')}
          </h2>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4">
              <FormField control={form.control} name="firstName" render={({
              field
            }) => <FormItem className="flex-1">
                    <FormLabel>{t('firstName')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input placeholder={t('firstName')} className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="lastName" render={({
              field
            }) => <FormItem className="flex-1">
                    <FormLabel>{t('lastName')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input placeholder={t('lastName')} className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>

            <FormField control={form.control} name="email" render={({
            field
          }) => <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input type="email" placeholder={t('emailPlaceholder')} className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="phone" render={({
            field
          }) => <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input type="tel" placeholder={t('phonePlaceholder')} className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="password" render={({
            field
          }) => <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <Button type="submit" className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90" disabled={isLoading}>
              {isLoading ? t('registering') : t('register')}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-safedrop-gold hover:underline">
            {t('login')}
          </Link>
        </div>
      </div>
    </div>;
};

const CustomerRegister = () => {
  return <LanguageProvider>
      <CustomerRegisterContent />
    </LanguageProvider>;
};

export default CustomerRegister;
