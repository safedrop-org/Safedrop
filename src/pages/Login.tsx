
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { MailIcon, LockIcon, UserIcon } from 'lucide-react';

const LoginContent = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check user type to redirect to appropriate dashboard
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single();

      toast.success('تم تسجيل الدخول بنجاح');

      if (profileData?.user_type === 'customer') {
        localStorage.setItem('customerAuth', 'true');
        navigate('/customer/dashboard');
      } else if (profileData?.user_type === 'admin') {
        localStorage.setItem('adminAuth', 'true');
        navigate('/admin/dashboard');
      } else if (profileData?.user_type === 'driver') {
        localStorage.setItem('driverAuth', 'true');
        navigate('/driver/dashboard');
      } else {
        navigate('/');
      }

    } catch (error: any) {
      toast.error('فشل تسجيل الدخول', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="max-w-md w-full px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto mb-4">
              <img 
                src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png" 
                alt="SafeDrop Logo" 
                className="h-20 w-auto" 
              />
            </div>
            <CardTitle className="text-2xl font-bold text-safedrop-primary">تسجيل الدخول</CardTitle>
            <CardDescription>
              أدخل بيانات حسابك للوصول إلى لوحة التحكم
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <MailIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="mail@example.com" 
                    className="pl-4 pr-10 rtl:pl-10 rtl:pr-4" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <a href="#" className="text-xs text-safedrop-gold hover:underline">
                    نسيت كلمة المرور؟
                  </a>
                </div>
                <div className="relative">
                  <LockIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-4 pr-10 rtl:pl-10 rtl:pr-4" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
                disabled={isLoading}
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
              
              <div className="text-center text-sm">
                ليس لديك حساب؟{' '}
                <a href="/register" className="text-safedrop-gold hover:underline">
                  إنشاء حساب جديد
                </a>
              </div>
              
              <div className="text-center text-sm">
                <a href="/admin/login" className="text-gray-500 hover:underline flex items-center justify-center gap-1">
                  <UserIcon className="h-4 w-4" />
                  <span>تسجيل دخول المشرف</span>
                </a>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
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
