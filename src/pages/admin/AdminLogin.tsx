
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldCheckIcon, LockIcon } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_PASSWORD = "SafeDrop@ibrahim2515974";

const AdminLoginContent = () => {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!password) {
      toast.error("يرجى إدخال كلمة المرور");
      setIsLoading(false);
      return;
    }

    try {
      if (password === ADMIN_PASSWORD) {
        // تخزين معلومات المصادقة للأدمن
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminEmail', 'admin@safedrop.com');
        
        const email = 'admin@safedrop.com';
        
        // التحقق من وجود المستخدم في قاعدة البيانات
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', 'admin')
          .maybeSingle();
          
        if (!existingUser) {
          // إنشاء حساب المشرف في قاعدة البيانات
          await supabase
            .from('profiles')
            .insert({
              id: 'admin',
              first_name: 'Admin',
              last_name: 'User',
              phone: '+966000000000',
              user_type: 'admin',
              email: 'admin@safedrop.com'
            });
            
          // التحقق من وجود دور المشرف وإضافته إذا لم يكن موجوداً
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // نتحقق أولاً من وجود دور المشرف
            const { data: existingRole } = await supabase
              .from('user_roles')
              .select('id')
              .eq('user_id', user.id)
              .eq('role', 'admin')
              .maybeSingle();
              
            // إذا لم يكن هناك دور مشرف موجود، قم بإنشائه
            if (!existingRole) {
              const { error: roleError } = await supabase
                .from('user_roles')
                .insert({
                  user_id: user.id,
                  role: 'admin'
                });
                
              if (roleError) {
                console.error('Error assigning admin role:', roleError);
              }
            }
          }
          
          console.log('Admin profile and role created');
        } else {
          console.log('Admin profile already exists');
        }
        
        toast.success("تم تسجيل الدخول بنجاح. مرحباً بك في لوحة تحكم المشرف");
        
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        throw new Error('كلمة المرور غير صحيحة');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || "كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى");
    } finally {
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
