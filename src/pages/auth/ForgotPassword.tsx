
import { useState } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailIcon, ArrowLeftIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ForgotPasswordContent = () => {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast.error(t('pleaseEnterEmail'));
      setIsLoading(false);
      return;
    }

    try {
      // First, check if the user exists in the database
      const { data: userExists, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      // If there's an error checking the user or the user doesn't exist
      if (checkError) {
        console.error('User check error:', checkError);
        // We'll still attempt password reset as Supabase handles this gracefully
      } else if (!userExists) {
        console.log('User not found with email:', email);
        toast.error(t('userNotFound'));
        setIsLoading(false);
        return;
      }

      // Process the password reset request
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error);
        
        if (error.message.includes('user not found')) {
          toast.error(t('userNotFound'));
        } else {
          toast.error(error.message || t('passwordResetError'));
        }
      } else {
        setIsSubmitted(true);
        toast.success(t('passwordResetEmailSent'));
      }
    } catch (error: any) {
      console.error('Reset password exception:', error);
      toast.error(t('passwordResetError'));
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
                {t('forgotPasswordTitle')}
              </CardTitle>
              <CardDescription>{t('forgotPasswordDescription')}</CardDescription>
            </CardHeader>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit}>
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
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('sending')}
                      </>
                    ) : (
                      t('sendResetLink')
                    )}
                  </Button>

                  <Link to="/login" className="flex items-center justify-center text-safedrop-gold hover:underline">
                    <ArrowLeftIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('backToLogin')}
                  </Link>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="py-6 space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-green-600">{t('passwordResetEmailSentDescription')}</p>
                  
                  <Button 
                    className="mt-4 bg-safedrop-gold hover:bg-safedrop-gold/90" 
                    onClick={() => navigate('/login')}
                  >
                    {t('backToLogin')}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ForgotPassword = () => {
  return (
    <LanguageProvider>
      <ForgotPasswordContent />
    </LanguageProvider>
  );
};

export default ForgotPassword;
