
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckIcon, MailIcon } from 'lucide-react';

const EmailVerificationContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get current session to see if the user is verified
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session) {
          // User is logged in, check verification status
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email_confirmed_at) {
            // Email is verified
            setVerified(true);

            // Get user type from metadata
            const userTypeValue = user.user_metadata?.user_type || null;
            setUserType(userTypeValue);
            
            // Fetch profile to confirm user type if metadata is missing
            if (!userTypeValue) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('user_type')
                .eq('id', user.id)
                .single();
                
              if (profileData) {
                setUserType(profileData.user_type);
              }
            }
          }
        }
      } catch (error) {
        console.error("Verification error:", error);
        toast.error("حدث خطأ أثناء التحقق من البريد الإلكتروني");
      } finally {
        setIsVerifying(false);
      }
    };

    checkSession();
  }, []);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-safedrop-primary mx-auto"></div>
          <h2 className="text-2xl font-bold">جاري التحقق من البريد الإلكتروني...</h2>
          <p className="text-gray-600">يرجى الانتظار قليلاً.</p>
        </div>
      </div>
    );
  }

  if (verified && userType === 'driver') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary">تم تأكيد البريد الإلكتروني بنجاح!</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-yellow-800">طلبك قيد المراجعة</h3>
            <p className="text-yellow-700 mt-2">
              شكراً لتسجيلك كسائق في منصة سيف دروب. طلبك قيد المراجعة الآن من قبل فريق الإدارة.
              سنخبرك عبر البريد الإلكتروني بمجرد الموافقة على طلبك.
            </p>
          </div>
          <div className="mt-6">
            <Button 
              onClick={handleGoToLogin} 
              className="bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              الذهاب إلى صفحة تسجيل الدخول
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (verified && userType === 'customer') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary">تم تأكيد البريد الإلكتروني بنجاح!</h2>
          <p className="text-gray-600 mt-4">
            شكراً لاستخدامك منصة سيف دروب. يمكنك الآن تسجيل الدخول واستخدام خدماتنا.
          </p>
          <div className="mt-6">
            <Button 
              onClick={handleGoToLogin} 
              className="bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              الذهاب إلى صفحة تسجيل الدخول
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <MailIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-safedrop-primary">تحقق من بريدك الإلكتروني</h2>
        <p className="text-gray-600 mt-4">
          لقد أرسلنا رسالة تأكيد إلى بريدك الإلكتروني. يرجى النقر على الرابط الموجود في الرسالة لتأكيد حسابك.
        </p>
        <div className="mt-6">
          <Button 
            onClick={handleGoToLogin} 
            className="bg-safedrop-gold hover:bg-safedrop-gold/90"
          >
            العودة لصفحة تسجيل الدخول
          </Button>
        </div>
      </div>
    </div>
  );
};

const EmailVerification = () => {
  return (
    <LanguageProvider>
      <EmailVerificationContent />
    </LanguageProvider>
  );
};

export default EmailVerification;
