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
    message: "كلمة المرور يجب أ�� تكون 8 أحرف على الأقل"
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
  const {
    t
  } = useLanguage();
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
            تم التسجيل بنجاح!
          </h2>
          <p className="mt-4 text-gray-600">
            شكراً لتسجيلك في سيف دروب. تم إرسال رسالة تأكيد إلى بريدك الإلكتروني.
            يرجى التحقق من بريدك الإلكتروني وتأكيد حسابك.
          </p>
          <p className="mt-4 text-gray-600">
            بعد تأكيد بريدك الإلكتروني، سيتم مراجعة طلبك كسائق من قبل فريقنا.
          </p>
          <div className="mt-8">
            <Button onClick={() => navigate('/login')} className="bg-safedrop-gold hover:bg-safedrop-gold/90">
              الذهاب إلى صفحة تسجيل الدخول
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
            <h3 className="text-amber-800 font-medium">يرجى الانتظار قبل المحاولة مرة أخرى</h3>
            <p className="text-amber-700 mt-1">الوقت المتبقي: {waitTime} ثانية</p>
            <p className="text-amber-600 text-sm mt-1">تم تجاوز الحد المسموح لمحاولات التسجيل. يرجى الانتظار قليلاً.</p>
          </div>}

        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={() => setShowDebugConsole(!showDebugConsole)} className="text-xs">
            {showDebugConsole ? 'إخفاء وضع المطور' : 'وضع المطور'}
          </Button>
        </div>

        {showDebugConsole && <div className="bg-gray-800 text-green-400 rounded-md p-4 mb-4 overflow-auto max-h-48 text-xs">
            <p>▶️ وضع المطور: هذه المعلومات تساعد في تشخيص المشكلات</p>
            <p>📡 API URL: https://lawatugvcjmrbxzgjfqm.supabase.co</p>
            <p>🖥️ تطبيق ويب: {window.location.origin}</p>
            {debugInfo && <>
                <p className="font-bold mt-2">⚠️ آخر خطأ:</p>
                <p>المرحلة: {debugInfo.stage}</p>
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(debugInfo.error, null, 2)}
                </pre>
                {debugInfo.attempted_data && <>
                    <p className="font-bold mt-1">البيانات المرسلة:</p>
                    <pre className="whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(debugInfo.attempted_data, null, 2)}
                    </pre>
                  </>}
              </>}
          </div>}

        {debugInfo && <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <h3 className="text-red-800 font-medium">معلومات تشخيص الخطأ:</h3>
            <p className="text-red-700 text-sm mt-1">المرحلة: {debugInfo.stage}</p>
            <p className="text-red-700 text-sm mt-1">رسالة الخطأ: {debugInfo.error?.message || JSON.stringify(debugInfo.error)}</p>
            {debugInfo.attempted_data && <details className="mt-2">
                <summary className="text-red-700 text-sm cursor-pointer">عرض البيانات المرسلة</summary>
                <pre className="text-xs bg-red-100 p-2 mt-1 rounded overflow-auto">
                  {JSON.stringify(debugInfo.attempted_data, null, 2)}
                </pre>
              </details>}
            {debugInfo.stage === 'profile_insert' && <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800 font-medium">معلومات مفيدة للتصحيح:</p>
                <ul className="list-disc list-inside text-xs text-yellow-700 mt-1">
                  <li>تأكد من أن حقول الجدول profiles تتطابق مع البيانات المرسلة</li>
                  <li>تأكد من أن سياسات RLS مفعلة بشكل صحيح</li>
                  <li>قد تكون هناك مشكلة في الربط بين المستخدم والملف الشخصي</li>
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

            <FormField control={form.control} name="birthDate" render={({
            field
          }) => <FormItem>
                  <FormLabel>{t('birthDate')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input type="date" placeholder={t('birthDate')} className="pl-10" {...field} />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="nationalId" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('nationalId')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('nationalIdPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="licenseNumber" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('licenseNumber')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('licenseNumberPlaceholder')} {...field} />
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
                      <Input placeholder={t('vehicleMakePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="vehicleInfo.model" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('vehicleModel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('vehicleModelPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="vehicleInfo.year" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('vehicleYear')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t('vehicleYearPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              <FormField control={form.control} name="vehicleInfo.plateNumber" render={({
              field
            }) => <FormItem>
                    <FormLabel>{t('plateNumber')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('plateNumberPlaceholder')} {...field} />
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