
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LockIcon, MailIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const LoginContent = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', email);
      
      // If email is admin email, redirect to admin login page
      if (email.toLowerCase() === 'admin@safedrop.com') {
        toast.info('يرجى استخدام صفحة تسجيل دخول المسؤول');
        navigate('/admin');
        setIsLoading(false);
        return;
      }

      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        
        if (error.message === 'Email not confirmed') {
          toast.error('البريد الإلكتروني غير مؤكد، يرجى التحقق من بريدك الإلكتروني وتأكيد حسابك');
        } else if (error.message === 'Invalid login credentials') {
          toast.error('بيانات الدخول غير صحيحة، يرجى التحقق من البريد الإلكتروني وكلمة المرور');
        } else {
          toast.error(error.message || 'حدث خطأ أثناء تسجيل الدخول');
        }
        setIsLoading(false);
        return;
      }
      
      if (!data.user) {
        throw new Error('فشل الحصول على معلومات المستخدم');
      }

      console.log('Login successful, user:', data.user);
      console.log('Session:', data.session);

      try {
        // Retrieve user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .maybeSingle();

        console.log("Profile data:", profile);
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
        }
        
        // Set authentication state based on profile if available, default to customer otherwise
        if (profile?.user_type === 'admin') {
          localStorage.setItem('adminAuth', 'true');
          localStorage.removeItem('customerAuth');
          localStorage.removeItem('driverAuth');
          navigate('/admin/dashboard');
        } else if (profile?.user_type === 'driver') {
          localStorage.setItem('driverAuth', 'true');
          localStorage.removeItem('customerAuth');
          localStorage.removeItem('adminAuth');
          
          // Check driver status if profile exists
          try {
            const { data: driverData, error: driverError } = await supabase
              .from('drivers')
              .select('status')
              .eq('id', data.user.id)
              .maybeSingle();

            if (driverError) {
              console.error("Error fetching driver status:", driverError);
            }

            console.log("Driver data:", driverData);

            // Navigate based on driver status if available
            if (driverData?.status === 'approved') {
              navigate('/driver/dashboard');
            } else {
              navigate('/driver/pending-approval');
            }
          } catch (err) {
            console.error("Exception when checking driver status:", err);
            // Default to pending approval page if error checking status
            navigate('/driver/pending-approval');
          }
        } else {
          // Default to customer for any other user_type or if profile doesn't exist
          localStorage.setItem('customerAuth', 'true');
          localStorage.removeItem('driverAuth');
          localStorage.removeItem('adminAuth');
          navigate('/customer/dashboard');
        }

        toast.success('تم تسجيل الدخول بنجاح، مرحباً بك');
      } catch (err) {
        console.error("Exception during profile handling:", err);
        // Even if profile check fails, continue to customer dashboard
        localStorage.setItem('customerAuth', 'true');
        localStorage.removeItem('driverAuth');
        localStorage.removeItem('adminAuth');
        navigate('/customer/dashboard');
        
        toast.success('تم تسجيل الدخول بنجاح، مرحباً بك');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      toast.error('فشل تسجيل الدخول: ' + (error.message || 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-safedrop-primary">
                {t('login')}
              </CardTitle>
              <CardDescription>
                دخول إلى حسابك في منصة سيف دروب
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <div className="relative">
                    <MailIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-3" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10 rtl:pl-4 rtl:pr-10"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <div className="relative">
                    <LockIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 rtl:left-auto rtl:right-3" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10 rtl:pl-4 rtl:pr-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 text-safedrop-gold border-gray-300 rounded focus:ring-safedrop-gold"
                    />
                    <Label htmlFor="remember" className="text-sm">تذكرني</Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-safedrop-gold hover:underline">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري تسجيل الدخول..." : t('login')}
                </Button>

                <div className="text-center text-sm">
                  ليس لديك حساب؟{' '}
                  <div className="flex justify-center gap-2 mt-2">
                    <Link to="/register/customer" className="text-safedrop-gold hover:underline font-semibold">
                      سجل كعميل
                    </Link>
                    <span className="text-gray-500">|</span>
                    <Link to="/register/driver" className="text-safedrop-gold hover:underline font-semibold">
                      سجل كسائق
                    </Link>
                  </div>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Login = () => {
  return (
    <LanguageProvider>
      <LoginContent />
    </LanguageProvider>
  );
};

export default Login;
