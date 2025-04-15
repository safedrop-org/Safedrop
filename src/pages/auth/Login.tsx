
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserIcon, TruckIcon, ShieldCheckIcon, LockIcon, MailIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginContent = () => {
  const { t, language } = useLanguage();
  const [userType, setUserType] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple validation
    if (!email || !password) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Simulate login request
    setTimeout(() => {
      setIsLoading(false);

      if (userType === 'admin') {
        // Redirect to admin login instead
        navigate('/admin');
        return;
      }
      
      // For demo purposes - using localStorage to simulate authentication
      if (userType === 'customer') {
        localStorage.setItem('customerAuth', 'true');
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في منصة سيف دروب",
        });
        navigate('/customer/dashboard');
      } else if (userType === 'driver') {
        localStorage.setItem('driverAuth', 'true');
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في منصة سيف دروب",
        });
        navigate('/driver/dashboard');
      }
    }, 1000);
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
              <Tabs defaultValue="customer" onValueChange={setUserType} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="customer" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span>{t('customer')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="driver" className="flex items-center gap-2">
                    <TruckIcon className="h-4 w-4" />
                    <span>{t('driver')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4" />
                    <span>{t('admin')}</span>
                  </TabsTrigger>
                </TabsList>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
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
                    <Label htmlFor="password">كلمة المرور</Label>
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
              </Tabs>
              
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
                  <Link 
                    to={userType === 'driver' ? '/register/driver' : '/register/customer'} 
                    className="text-safedrop-gold hover:underline font-semibold"
                  >
                    سجل الآن
                  </Link>
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
