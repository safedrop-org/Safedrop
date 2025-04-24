
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
import { useAuth } from '@/components/auth/AuthContext';

const LoginContent = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    console.log("User in login page:", user);
    if (user) {
      redirectBasedOnProfile(user.id);
    }
  }, [user]);

  const redirectBasedOnProfile = async (userId) => {
    try {
      console.log("Checking profile for user:", userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      console.log("Found profile:", profile);
      
      if (profile?.user_type === 'admin') {
        navigate('/admin/dashboard');
      } else if (profile?.user_type === 'driver') {
        checkDriverStatus(userId);
      } else {
        // Default to customer
        navigate('/customer/dashboard');
      }
    } catch (err) {
      console.error("Error checking profile:", err);
    }
  };

  const checkDriverStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('status')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking driver status:", error);
        navigate('/driver/pending-approval');
        return;
      }
      
      console.log("Driver status:", data);
      
      if (data?.status === 'approved') {
        navigate('/driver/dashboard');
      } else {
        navigate('/driver/pending-approval');
      }
    } catch (err) {
      console.error("Error checking driver status:", err);
      navigate('/driver/pending-approval');
    }
  };

  const handleLogin = async (e) => {
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
        } else if (error.message.includes('Invalid login')) {
          toast.error('بيانات الدخول غير صحيحة، يرجى التحقق من البريد الإلكتروني وكلمة المرور');
        } else {
          toast.error(error.message || 'حدث خطأ أثناء تسجيل الدخول');
        }
        setIsLoading(false);
        return;
      }
      
      if (!data.user) {
        toast.error('فشل الحصول على معلومات المستخدم');
        setIsLoading(false);
        return;
      }

      console.log('Login successful, user:', data.user);
      console.log('Session:', data.session);
      
      toast.success('تم تسجيل الدخول بنجاح، مرحباً بك');
      
      // Auth state change listener should handle the redirect
      // The redirectBasedOnProfile function will be called from the useEffect
    } catch (error) {
      console.error('Login exception:', error);
      toast.error('فشل تسجيل الدخول: ' + (error.message || 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.'));
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
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
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
