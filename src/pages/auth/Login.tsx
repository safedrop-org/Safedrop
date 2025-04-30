
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import { useAuth } from '@/hooks/useAuth';

const ADMIN_EMAIL = 'admin@safedrop.com';
const ADMIN_PASSWORD = 'SafeDrop@ibrahim2515974';

const LoginContent = () => {
  const { t, language } = useLanguage();
  const { user, userType } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const forceLogout = queryParams.get('logout') === 'true';
  const redirectToAdmin = queryParams.get('redirect') === 'admin';

  // Redirect if already logged in
  useEffect(() => {
    console.log("User in login page:", user);
    console.log("User type in login page:", userType);
    
    if (forceLogout) {
      console.log("Force logout detected, clearing all auth states");
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('customerAuth');
      localStorage.removeItem('driverAuth');
      // Remove the logout parameter from URL
      navigate('/login', { replace: true });
      return;
    }
    
    // First check localStorage for admin auth
    if (localStorage.getItem('adminAuth') === 'true') {
      // For admin, redirect to admin dashboard
      console.log("Redirecting to admin dashboard based on localStorage");
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    
    if (user) {
      console.log("User already logged in, redirecting based on type:", userType);
      // Check localStorage for user type flags
      if (localStorage.getItem('customerAuth') === 'true') {
        console.log("Redirecting to customer dashboard based on localStorage");
        navigate('/customer/dashboard', { replace: true });
        return;
      }
      if (localStorage.getItem('driverAuth') === 'true') {
        console.log("Redirecting to driver dashboard based on localStorage");
        navigate('/driver/dashboard', { replace: true });
        return;
      }

      // If no localStorage flags, try to use the userType from context
      if (userType === 'customer') {
        console.log("Redirecting to customer dashboard based on userType");
        navigate('/customer/dashboard', { replace: true });
      } else if (userType === 'driver') {
        console.log("Redirecting to driver dashboard based on userType");
        checkDriverStatusAndRedirect(user.id);
      } else {
        // If still no user type, check the user metadata
        if (user.user_metadata?.user_type) {
          redirectBasedOnUserType(user.user_metadata.user_type, user.id);
        } else {
          // Last resort: check profile directly
          console.log("Checking profile for user:", user.id);
          redirectBasedOnProfile(user.id);
        }
      }
    }
  }, [user, userType, navigate, forceLogout]);
  
  const redirectBasedOnUserType = (type: string, userId: string) => {
    console.log("Redirecting based on user type:", type);
    if (type === 'admin') {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin/dashboard', {
        replace: true
      });
    } else if (type === 'customer') {
      localStorage.setItem('customerAuth', 'true');
      navigate('/customer/dashboard', {
        replace: true
      });
    } else if (type === 'driver') {
      localStorage.setItem('driverAuth', 'true');
      checkDriverStatusAndRedirect(userId);
    } else {
      toast.error("نوع المستخدم غير معروف");
    }
  };
  
  const checkDriverStatusAndRedirect = async (userId: string) => {
    try {
      console.log("Checking driver status for:", userId);
      const {
        data,
        error
      } = await supabase.from('drivers').select('status').eq('id', userId).maybeSingle();
      if (error) {
        console.error("Error checking driver status:", error);
        navigate('/driver/pending-approval', {
          replace: true
        });
        return;
      }
      console.log("Driver status:", data);
      if (data?.status === 'approved') {
        navigate('/driver/dashboard', {
          replace: true
        });
      } else {
        navigate('/driver/pending-approval', {
          replace: true
        });
      }
    } catch (err) {
      console.error("Error checking driver status:", err);
      navigate('/driver/pending-approval', {
        replace: true
      });
    }
  };
  
  const redirectBasedOnProfile = async (userId: string) => {
    try {
      console.log("Checking profile for user ID:", userId);
      const {
        data: profile,
        error
      } = await supabase.from('profiles').select('user_type').eq('id', userId).maybeSingle();
      if (error) {
        console.error("Error fetching profile:", error);
        toast.error(t('profileCheckError'));
        return;
      }
      console.log("Found profile:", profile);
      if (profile) {
        // Redirect based on user type
        redirectBasedOnUserType(profile.user_type, userId);
      } else {
        console.log("No profile found, checking user metadata");
        const {
          data: userData
        } = await supabase.auth.getUser();
        if (userData?.user?.user_metadata?.user_type) {
          redirectBasedOnUserType(userData.user.user_metadata.user_type, userId);
        } else {
          console.log("No user type found in metadata");
          toast.error(t('unknownUserType'));
        }
      }
    } catch (err) {
      console.error("Error checking profile:", err);
      toast.error(t('profileCheckError'));
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!email || !password) {
      toast.error(t('pleaseEnterEmailPassword'));
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Attempting login with:', email);

      // If email is admin email, handle admin login
      if (email.toLowerCase() === ADMIN_EMAIL) {
        if (password !== ADMIN_PASSWORD) {
          toast.error(t('invalidCredentials'));
          setIsLoading(false);
          return;
        }

        console.log("Admin credentials verified");
        
        // Store admin authentication info
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminEmail', ADMIN_EMAIL);
        
        // Check if admin exists in profiles table
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', 'admin')
          .maybeSingle();
          
        if (!existingUser) {
          console.log("Creating admin profile...");
          // Create admin profile if doesn't exist
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: 'admin',
              first_name: 'Admin',
              last_name: 'User',
              phone: '+966000000000',
              user_type: 'admin',
              email: ADMIN_EMAIL
            });
            
          if (profileError) {
            console.error("Error creating admin profile:", profileError);
          } else {
            console.log("Admin profile created successfully");
          }
        } else {
          console.log("Admin profile already exists");
        }
        
        // Check and create admin role if needed
        try {
          console.log("Checking admin role...");
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('id')
            .eq('user_id', 'admin')
            .eq('role', 'admin')
            .maybeSingle();
            
          if (!existingRole) {
            console.log("Creating admin role...");
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: 'admin',
                role: 'admin'
              });
              
            if (roleError) {
              console.error('Error assigning admin role:', roleError);
            } else {
              console.log("Admin role created successfully");
            }
          } else {
            console.log("Admin role already exists");
          }
        } catch (roleError) {
          console.error('Error checking/creating admin role:', roleError);
        }
        
        toast.success(t('loginAsAdmin'));
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard', { replace: true });
        setIsLoading(false);
        return;
      }

      // Regular user login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        if (error.message === 'Email not confirmed') {
          toast.error(t('emailNotConfirmed'));
        } else if (error.message.includes('Invalid login')) {
          toast.error(t('invalidCredentials'));
        } else {
          toast.error(error.message || t('loginError'));
        }
        setIsLoading(false);
        return;
      }
      
      if (!data.user) {
        toast.error(t('failedToGetUserInfo'));
        setIsLoading(false);
        return;
      }
      
      console.log('Login successful, user:', data.user);
      console.log('User metadata:', data.user.user_metadata);
      toast.success(t('loginSuccess'));

      // Handle user redirection based on type
      if (data.user.user_metadata?.user_type) {
        console.log("Found user_type in metadata:", data.user.user_metadata.user_type);
        const userType = data.user.user_metadata.user_type;
        if (userType === 'customer') {
          localStorage.setItem('customerAuth', 'true');
          navigate('/customer/dashboard', { replace: true });
        } else if (userType === 'driver') {
          localStorage.setItem('driverAuth', 'true');
          checkDriverStatusAndRedirect(data.user.id);
        }
      } else {
        // Fallback to profile check
        console.log("No user_type in metadata, checking profile");
        await redirectBasedOnProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Login exception:', error);
      toast.error(t('loginError') + ': ' + (error.message || ''));
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
                {redirectToAdmin ? t('adminLogin') : t('login')}
              </CardTitle>
              <CardDescription>
                {redirectToAdmin ? t('adminLoginDescription') : t('loginDescription')}
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
                      onChange={e => setEmail(e.target.value)}
                      defaultValue={redirectToAdmin ? ADMIN_EMAIL : ''}
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
                      onChange={e => setPassword(e.target.value)} 
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
                      onChange={e => setRememberMe(e.target.checked)} 
                    />
                    <Label htmlFor="remember" className="text-sm">{t('rememberMe')}</Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-safedrop-gold hover:underline">
                    {t('forgotPassword')}
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90" 
                  disabled={isLoading}
                >
                  {isLoading ? t('loggingIn') : t('login')}
                </Button>

                {!redirectToAdmin && (
                  <div className="text-center text-sm">
                    {t('noAccount')}{' '}
                    <div className="flex justify-center gap-2 mt-2">
                      <Link to="/register/customer" className="text-safedrop-gold hover:underline font-semibold">
                        {t('registerAsCustomer')}
                      </Link>
                      <span className="text-gray-500">|</span>
                      <Link to="/register/driver" className="text-safedrop-gold hover:underline font-semibold">
                        {t('registerAsDriver')}
                      </Link>
                    </div>
                  </div>
                )}
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
