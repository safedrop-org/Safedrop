
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheckIcon, LockIcon } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_EMAIL = "admin@safedrop.com";
const ADMIN_PASSWORD = "SafeDrop@admin2024";

const AdminLoginContent = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // For development purposes, allow direct login with predefined credentials
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Set admin auth in localStorage
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminEmail', email);
        
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة تحكم المشرف",
        });
        
        navigate('/admin/dashboard');
        return;
      }
      
      // Fallback to check with actual Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Check if the user has admin role (this would require a proper RLS policy)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user?.id)
        .single();
      
      if (profileError) throw profileError;
      
      if (profileData?.user_type === 'admin') {
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('adminId', data.user?.id);
        
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة تحكم المشرف",
        });
        
        navigate('/admin/dashboard');
      } else {
        throw new Error('ليس لديك صلاحيات المشرف');
      }
    } catch (error: any) {
      toast({
        title: "فشل تسجيل الدخول",
        description: error.message || "بيانات تسجيل الدخول غير صحيحة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
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
                أدخل بيانات تسجيل الدخول للوصول إلى لوحة تحكم المشرف
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@safedrop.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
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
