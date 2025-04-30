import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { useNavigate } from 'react-router-dom';
import { UserIcon, LockIcon, MailIcon, PhoneIcon, Calendar } from 'lucide-react';

const driverRegisterSchema = z.object({
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
  }),
  birthDate: z.string().min(1, {
    message: "تاريخ الميلاد مطلوب"
  }),
  nationalId: z.string().min(10, {
    message: "رقم الهوية مطلوب"
  }),
  licenseNumber: z.string().min(5, {
    message: "رقم الرخصة مطلوب"
  }),
  vehicleInfo: z.object({
    make: z.string().min(2, {
      message: "نوع السيارة مطلوب"
    }),
    model: z.string().min(2, {
      message: "موديل السيارة مطلوب"
    }),
    year: z.string().regex(/^\d{4}$/, {
      message: "السنة يجب أن تكون 4 أرقام"
    }),
    plateNumber: z.string().min(4, {
      message: "رقم اللوحة مطلوب"
    })
  })
});

type DriverFormValues = z.infer<typeof driverRegisterSchema>;

const DriverRegisterContent = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebugConsole, setShowDebugConsole] = useState(false);
  const [waitTime, setWaitTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (waitTime > 0) {
      timer = setTimeout(() => {
        setWaitTime(waitTime - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [waitTime]);

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverRegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      birthDate: '',
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

  const handleRateLimitError = () => {
    setWaitTime(60);
    toast.error('تم تجاوز الحد المسموح للتسجيل، يرجى الانتظار دقيقة واحدة قبل المحاولة مرة أخرى');
  };

  const checkEmailExists = async (email: string) => {
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      });
      if (!error) return true;
      if (error.message.includes('not found')) return false;
      return null;
    } catch {
      return null;
    }
  };

  const onSubmit = async (data: DriverFormValues) => {
    if (waitTime > 0) {
      toast.error(`يرجى الانتظار ${waitTime} ثانية قبل المحاولة مرة أخرى`);
      return;
    }
    setIsLoading(true);
    setDebugInfo(null);
    try {
      const {
        data: authData,
        error: signUpError
      } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            user_type: 'driver',
            birth_date: data.birthDate
          },
          emailRedirectTo: window.location.origin + '/email-verification'
        }
      });
      if (signUpError) {
        setDebugInfo({
          stage: 'auth_signup',
          error: signUpError
        });
        if (signUpError.message.includes('rate limit') || signUpError.message.toLowerCase().includes('email rate limit exceeded') || signUpError.code === 'over_email_send_rate_limit') {
          handleRateLimitError();
        } else if (signUpError.message.includes('already registered')) {
          toast.error('البريد الإلكتروني مسجل بالفعل، يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول');
        } else {
          toast.error('خطأ أثناء إنشاء الحساب: ' + signUpError.message);
        }
        setIsLoading(false);
        return;
      }
      if (!authData.user) {
        setDebugInfo({
          stage: 'auth_signup',
          error: 'No user data returned',
          response: authData
        });
        toast.error('فشل إنشاء الحساب، يرجى المحاولة مرة أخرى');
        setIsLoading(false);
        return;
      }
      const userId = authData.user.id;
      const profileData = {
        id: userId,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        user_type: 'driver',
        birth_date: data.birthDate
      };
      const {
        error: profileError
      } = await supabase.from('profiles').insert(profileData);
      if (profileError) {
        setDebugInfo({
          stage: 'profile_insert',
          error: profileError,
          attempted_data: profileData
        });
        toast.error('خطأ أثناء حفظ بيانات الحساب، يرجى المحاولة لاحقًا');
        setIsLoading(false);
        return;
      }
      const driverData = {
        id: userId,
        national_id: data.nationalId,
        license_number: data.licenseNumber,
        vehicle_info: {
          make: data.vehicleInfo.make,
          model: data.vehicleInfo.model,
          year: data.vehicleInfo.year,
          plateNumber: data.vehicleInfo.plateNumber
        },
        status: 'pending',
        is_available: false
      };
      const {
        error: driverInsertError
      } = await supabase.from('drivers').insert(driverData);
      if (driverInsertError) {
        setDebugInfo({
          stage: 'driver_insert',
          error: driverInsertError,
          attempted_data: driverData
        });
        toast.error('خطأ أثناء حفظ بيانات السائق، يرجى المحاولة لاحقًا');
        setIsLoading(false);
        return;
      }
      const {
        error: roleError
      } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: 'driver'
      });
      if (roleError) {
        console.error("Error assigning driver role:", roleError);
        toast.warning("تم إنشاء الحساب، لكن حدثت مشكلة في تعيين الدور");
      }
      setRegistrationComplete(true);
      toast.success(t('registrationSuccess'));
    } catch (error: any) {
      setDebugInfo({
        stage: 'unexpected_error',
        error
      });
      toast.error('حدث خطأ غير متوقع أثناء التسجيل، يرجى المحاولة مرة أخرى');
      setSubmitAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationComplete) {
    return <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <img src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png" alt="SafeDrop Logo" className="mx-auto h-20 w-auto mb-4" />
          <h2 className="text-2xl font-bold text-safedrop-primary mt-6">
            {t('registrationSuccess')}
          </h2>
          <p className="mt-4 text-gray-600">
            {language === 'ar' ? 'شكراً لتسجيلك في سيف دروب. تم إرسال رسالة تأكيد إلى بريدك الإلكتروني.' : 
            'Thank you for registering with SafeDrop. A confirmation email has been sent to your email.'}
          </p>
          <p className="mt-4 text-gray-600">
            {language === 'ar' ? 'بعد تأكيد بريدك الإلكتروني، سيتم مراجعة طلبك كسائق من قبل فريقنا.' : 
            'After confirming your email, your driver application will be reviewed by our team.'}
          </p>
          <div className="mt-8">
            <Button onClick={() => navigate('/login')} className="bg-safedrop-gold hover:bg-safedrop-gold/90">
              {t('login')}
            </Button>
          </div>
        </div>
      </div>;
  }

  return <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8">
        <div className="text-center">
          <img alt="SafeDrop Logo" className="mx-auto h-20 w-auto mb-4" src="/lovable-uploads/264169e0-0b4b-414f-b808-612506987f4a.png" />
          <h2 className="text-3xl font-bold text-safedrop-primary">{t('driverRegister')}</h2>
        </div>

        {waitTime > 0 && <div className="bg-amber-50 border border-amber-300 rounded-md p-4 mb-4 text-center">
            <h3 className="text-amber-800 font-medium">{language === 'ar' ? 'يرجى الانتظار قبل المحاولة مرة أخرى' : 'Please wait before trying again'}</h3>
            <p className="text-amber-700 mt-1">{language === 'ar' ? `الوقت المتبقي: ${waitTime} ثانية` : `Time remaining: ${waitTime} seconds`}</p>
            <p className="text-amber-600 text-sm mt-1">{language === 'ar' ? 'تم تجاوز الحد المسموح لمحاولات التسجيل. يرجى الانتظار قليلاً.' : 'Registration attempt limit exceeded. Please wait a moment.'}</p>
          </div>}

        {showDebugConsole}

        {debugInfo && <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <h3 className="text-red-800 font-medium">{language === 'ar' ? 'معلومات تشخيص الخطأ:' : 'Debug Information:'}</h3>
            <p className="text-red-700 text-sm mt-1">{language === 'ar' ? `المرحلة: ${debugInfo.stage}` : `Stage: ${debugInfo.stage}`}</p>
            <p className="text-red-700 text-sm mt-1">{language === 'ar' ? `رسالة الخطأ: ${debugInfo.error?.message || JSON.stringify(debugInfo.error)}` : `Error message: ${debugInfo.error?.message || JSON.stringify(debugInfo.error)}`}</p>
            {debugInfo.attempted_data && <details className="mt-2">
                <summary className="text-red-700 text-sm cursor-pointer">{language === 'ar' ? 'عرض البيانات المرسلة' : 'View submitted data'}</summary>
                <pre className="text-xs bg-red-100 p-2 mt-1 rounded overflow-auto">
                  {JSON.stringify(debugInfo.attempted_data, null, 2)}
                </pre>
              </details>}
            {debugInfo.stage === 'profile_insert' && <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800 font-medium">{language === 'ar' ? 'معلومات مفيدة للتصحيح:' : 'Helpful debugging information:'}</p>
                <ul className="list-disc list-inside text-xs text-yellow-700 mt-1">
                  <li>{language === 'ar' ? 'تأكد من أن حقول الجدول profiles تتطابق مع البيانات المرسلة' : 'Ensure profiles table fields match the submitted data'}</li>
                  <li>{language === 'ar' ? 'تأكد من أن سياسات RLS مفعلة بشكل صحيح' : 'Verify that RLS policies are correctly configured'}</li>
                  <li>{language === 'ar' ? 'قد تكون هناك مشكلة في الربط بين المستخدم والملف الشخصي' : 'There may be an issue linking the user and profile'}</li>
                </ul>
              </div>}
          </div>}

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
                        <Input placeholder={language === 'ar' ? 'الاسم الأول' : 'First Name'} className="pl-10" {...field} />
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
                        <Input placeholder={language === 'ar' ? 'اسم العائلة' : 'Last Name'} className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>

            <FormField control={form.control} name="birthDate" render={({
            field
          }) => <FormItem>
                  <FormLabel>{t('birthDate')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input type="date" placeholder={language === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'} className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="email" render={({
            field
          }) => <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input type="email" placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'} className="pl-10" {...field} />
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
                      <Input type="tel" placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} className="pl-10" {...field} />
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
                      <Input type="password" placeholder={language === 'ar' ? '••••••••' : '••••••••'} className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="nationalId" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('nationalId')}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === 'ar' ? 'رقم الهوية الوطنية' : 'National ID'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="licenseNumber" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('licenseNumber')}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === 'ar' ? 'رقم رخصة القيادة' : 'License Number'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="vehicleInfo.make" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('vehicleMake')}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === 'ar' ? 'نوع السيارة' : 'Vehicle Make'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="vehicleInfo.model" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('vehicleModel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === 'ar' ? 'موديل السيارة' : 'Vehicle Model'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="vehicleInfo.year" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('vehicleYear')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={language === 'ar' ? 'سنة الصنع' : 'Vehicle Year'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="vehicleInfo.plateNumber" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('plateNumber')}</FormLabel>
                    <FormControl>
                      <Input placeholder={language === 'ar' ? 'رقم اللوحة' : 'Plate Number'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>

            <Button type="submit" className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90" disabled={isLoading || waitTime > 0}>
              {isLoading ? t('registering') : t('register')}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          {t('alreadyHaveAccount')}{' '}
          <a href="/login" className="text-safedrop-gold hover:underline">
            {t('login')}
          </a>
        </div>
      </div>
    </div>;
};

const DriverRegister = () => {
  return <LanguageProvider>
      <DriverRegisterContent />
    </LanguageProvider>;
};

export default DriverRegister;
