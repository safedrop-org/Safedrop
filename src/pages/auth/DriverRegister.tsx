
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useLanguage } from '@/components/ui/language-context';
import { useNavigate } from 'react-router-dom';
import { UserIcon, LockIcon, MailIcon, PhoneIcon, UploadIcon } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

const driverRegisterSchema = z.object({
  firstName: z.string().min(2, { message: "الاسم الأول مطلوب" }),
  lastName: z.string().min(2, { message: "اسم العائلة مطلوب" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  phone: z.string().min(10, { message: "رقم الهاتف غير صالح" }),
  password: z.string().min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }),
  nationalId: z.string().min(10, { message: "رقم الهوية مطلوب" }),
  licenseNumber: z.string().min(5, { message: "رقم الرخصة مطلوب" }),
  nationalIdFile: z.instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, { message: "الحجم الأقصى للملف 5 ميجابايت" })
    .refine(file => ALLOWED_FILE_TYPES.includes(file.type), { message: "نوع الملف غير مسموح به" }),
  licenseFile: z.instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, { message: "الحجم الأقصى للملف 5 ميجابايت" })
    .refine(file => ALLOWED_FILE_TYPES.includes(file.type), { message: "نوع الملف غير مسموح به" }),
  vehicleInfo: z.object({
    make: z.string().min(2, { message: "نوع السيارة مطلوب" }),
    model: z.string().min(2, { message: "موديل السيارة مطلوب" }),
    year: z.string().regex(/^\d{4}$/, { message: "السنة يجب أن تكون 4 أرقام" }),
    plateNumber: z.string().min(4, { message: "رقم اللوحة مطلوب" })
  })
});

const DriverRegister = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof driverRegisterSchema>>({
    resolver: zodResolver(driverRegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      nationalId: '',
      licenseNumber: '',
      vehicleInfo: {
        make: '',
        model: '',
        year: '',
        plateNumber: ''
      }
    }
  });

  const onSubmit = async (data: z.infer<typeof driverRegisterSchema>) => {
    setIsLoading(true);
    try {
      // Check if user is blacklisted
      const { data: blacklistData, error: blacklistError } = await supabase.rpc('is_blacklisted', {
        email: data.email,
        phone: data.phone,
        national_id: data.nationalId
      });

      if (blacklistError) throw blacklistError;
      if (blacklistData) {
        toast.error(t('registrationBlocked'), {
          description: t('blacklistedMessage')
        });
        return;
      }

      // Upload national ID document
      const nationalIdPath = `driver_documents/${Date.now()}_national_id_${data.nationalId}`;
      const { error: nationalIdUploadError } = await supabase.storage
        .from('driver_documents')
        .upload(nationalIdPath, data.nationalIdFile);

      if (nationalIdUploadError) throw nationalIdUploadError;

      // Upload license document
      const licensePath = `driver_documents/${Date.now()}_license_${data.licenseNumber}`;
      const { error: licenseUploadError } = await supabase.storage
        .from('driver_documents')
        .upload(licensePath, data.licenseFile);

      if (licenseUploadError) throw licenseUploadError;

      // Sign up user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            user_type: 'driver'
          }
        }
      });

      if (signUpError) throw signUpError;

      // Insert driver details
      const { error: driverInsertError } = await supabase
        .from('drivers')
        .insert({
          id: authData.user?.id,
          national_id: data.nationalId,
          license_number: data.licenseNumber,
          license_image: licensePath,
          vehicle_info: data.vehicleInfo,
          documents: {
            national_id_image: nationalIdPath
          }
        });

      if (driverInsertError) throw driverInsertError;

      toast.success(t('registrationSuccess'), {
        description: t('driverRegistrationPendingDescription')
      });

      navigate('/');
    } catch (error: any) {
      toast.error(t('registrationError'), {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8">
        <div className="text-center">
          <img 
            src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png" 
            alt="SafeDrop Logo" 
            className="mx-auto h-20 w-auto mb-4" 
          />
          <h2 className="text-3xl font-bold text-safedrop-primary">
            {t('driverRegister')}
          </h2>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Information */}
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t('firstName')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input 
                          placeholder={t('firstName')} 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t('lastName')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input 
                          placeholder={t('lastName')} 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input 
                        type="email" 
                        placeholder={t('emailPlaceholder')} 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input 
                        type="tel" 
                        placeholder={t('phonePlaceholder')} 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Driver Documents */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nationalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('nationalId')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('nationalIdPlaceholder')} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('licenseNumber')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('licenseNumberPlaceholder')} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Document File Uploads */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nationalIdFile"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>{t('nationalIdDocument')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UploadIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input 
                          type="file" 
                          accept=".jpg,.jpeg,.png,.pdf" 
                          className="pl-10 file:mr-4 file:rounded-full file:border-0 file:bg-safedrop-gold/10 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-safedrop-gold/20"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseFile"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>{t('licenseDocument')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UploadIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input 
                          type="file" 
                          accept=".jpg,.jpeg,.png,.pdf" 
                          className="pl-10 file:mr-4 file:rounded-full file:border-0 file:bg-safedrop-gold/10 file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-safedrop-gold/20"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Vehicle Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleInfo.make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicleMake')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('vehicleMakePlaceholder')} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleInfo.model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicleModel')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('vehicleModelPlaceholder')} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleInfo.year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicleYear')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder={t('vehicleYearPlaceholder')} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleInfo.plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('plateNumber')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('plateNumberPlaceholder')} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
              disabled={isLoading}
            >
              {isLoading ? t('registering') : t('register')}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          {t('alreadyHaveAccount')}{' '}
          <a 
            href="/login" 
            className="text-safedrop-gold hover:underline"
          >
            {t('login')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default DriverRegister;
