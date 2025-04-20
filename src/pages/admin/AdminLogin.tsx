
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheckIcon, LockIcon } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';

const ADMIN_PASSWORD = "SafeDrop@ibrahim2515974";

const AdminLoginContent = () => {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // تحقق عند تحميل الصفحة إذا كان الأدمن مسجل دخوله
  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('adminAuth') === 'true';
    if (isAdminLoggedIn) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!password) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "يرجى إدخال كلمة المرور",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password === ADMIN_PASSWORD) {
      // تعيين معلومات المصادقة للمشرف في التخزين المحلي
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminEmail', 'admin@safedrop.com');

      // إزالة أي علامات صلاحيات أخرى بعد تسجيل دخول الأدمن
      localStorage.removeItem('customerAuth');
      localStorage.removeItem('driverAuth');

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في لوحة تحكم المشرف",
      });

      // ننتظر قليلاً قبل التنقل لضمان تحديث حالة التخزين بشكل متزامن
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 150);

      setIsLoading(false);
      return;
    } else {
      toast({
        title: "فشل تسجيل الدخول",
        description: "كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-16 bg-gray-50">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-safedrop-primary">
                تسجيل دخول المشرف
              </CardTitle>
              <CardDescription>
                أدخل كلمة المرور للوصول إلى لوحة تحكم المشرف
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <LockIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      className="pr-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري التحقق..." : "تسجيل الدخول"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

const AdminLogin = () => {
  return (
    <LanguageProvider>
      <AdminLoginContent />
    </LanguageProvider>
  );
};

export default AdminLogin;
