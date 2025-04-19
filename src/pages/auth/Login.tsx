
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const LoginContent = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: t('loginError'),
        description: t('pleaseEnterEmailAndPassword'),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (email.toLowerCase() === 'admin@safedrop.com') {
        toast({
          title: t('adminLoginRedirectTitle'),
          description: t('adminLoginRedirectDescription'),
        });
        navigate('/admin');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error(t('failedToGetUserInfo'));

      // Since there is no 'profiles' table or profile data, skip fetching profile
      // Store user ID in localStorage for auth state tracking
      localStorage.setItem('userId', data.user.id);

      // Determine user type based on email domain or other logic if needed, for now assume customer
      if (email.toLowerCase().endsWith('@safedrop.com')) {
        localStorage.setItem('adminAuth', 'true');
        localStorage.removeItem('customerAuth');
        localStorage.removeItem('driverAuth');
        toast({
          title: t('loginSuccess'),
          description: t('welcomeToSafedrop'),
        });
        navigate('/admin');
      } else {
        // Check if user is a driver and redirect accordingly
        // Fetch driver status
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('status')
          .eq('id', data.user.id)
          .maybeSingle();

        if (driverError) {
          throw driverError;
        }

        if (driverData) {
          if (driverData.status === 'approved') {
            localStorage.setItem('driverAuth', 'true');
            localStorage.removeItem('customerAuth');
            localStorage.removeItem('adminAuth');
            toast({
              title: t('loginSuccess'),
              description: t('welcomeToSafedrop'),
            });
            navigate('/driver/dashboard');
          } else if (driverData.status === 'pending') {
            localStorage.setItem('driverAuth', 'true');
            localStorage.removeItem('customerAuth');
            localStorage.removeItem('adminAuth');
            toast({
              title: t('pendingApprovalTitle'),
              description: t('pendingApprovalDescription'),
            });
            navigate('/driver/pending-approval');
          } else if (driverData.status === 'rejected') {
            localStorage.setItem('driverAuth', 'true');
            localStorage.removeItem('customerAuth');
            localStorage.removeItem('adminAuth');
            toast({
              title: t('rejectedAccountTitle'),
              description: t('rejectedAccountDescription'),
              variant: 'destructive'
            });
            navigate('/driver/pending-approval');
          }
        } else {
          // Default to customer if no driver data found
          localStorage.setItem('customerAuth', 'true');
          localStorage.removeItem('driverAuth');
          localStorage.removeItem('adminAuth');
          toast({
            title: t('loginSuccess'),
            description: t('welcomeToSafedrop'),
          });
          navigate('/customer/dashboard');
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: t('loginFailed'),
        description: error.message || t('invalidCredentialsTryAgain'),
        variant: "destructive",
      });
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

