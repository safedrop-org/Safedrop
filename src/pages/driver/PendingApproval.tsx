import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Clock, LogOut, XCircle, AlertTriangle } from 'lucide-react';

const PendingApprovalContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [driverStatus, setDriverStatus] = useState<'pending' | 'approved' | 'rejected' | 'frozen' | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [rejectionCount, setRejectionCount] = useState(0);
  const [canReapply, setCanReapply] = useState(true);

  useEffect(() => {
    const checkDriverStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate('/login');
          return;
        }

        const { data: driver, error } = await supabase
          .from('drivers')
          .select('status, rejection_reason')
          .eq('id', session.user.id)
          .single();

        if (error || !driver) {
          toast.error("حدث خطأ أثناء جلب بيانات الحساب");
          navigate('/login');
          return;
        }

        setDriverStatus(driver.status);
        setRejectionReason(driver.rejection_reason || null);

        // Fetch rejection count from localStorage
        const count = Number(localStorage.getItem('driverRejectionCount')) || 0;
        setRejectionCount(count);

        if (driver.status === 'approved') {
          navigate('/driver/dashboard');
          return;
        }

        if (driver.status === 'frozen') {
          toast.error('تم تعطيل حسابك مؤقتًا بسبب رفض مرتين متتاليتين. يرجى التواصل مع الدعم.');
          setCanReapply(false);
          return;
        }

        if (driver.status === 'rejected' && count >= 2) {
          // Freeze account due to rejection count
          setDriverStatus('frozen');
          toast.error('تم تعطيل حسابك مؤقتًا بسبب رفض مرتين متتاليتين. يرجى التواصل مع الدعم.');
          setCanReapply(false);
          return;
        }

        if (driver.status === 'rejected' && count < 2) {
          setCanReapply(true);
          return;
        }
      } catch (error) {
        console.error("Error fetching driver status:", error);
        toast.error("حدث خطأ أثناء جلب بيانات الحساب");
      } finally {
        setLoading(false);
      }
    };

    checkDriverStatus();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('driverAuth');
    localStorage.removeItem('userId');
    localStorage.removeItem('driverRejectionCount');
    navigate('/login');
  };

  const handleReapply = () => {
    if (!canReapply) return;
    // Allow reapply once after rejection, increment count
    const newCount = rejectionCount + 1;
    localStorage.setItem('driverRejectionCount', newCount.toString());
    navigate('/driver/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-safedrop-primary mx-auto"></div>
          <h2 className="text-2xl font-bold">جاري التحميل...</h2>
        </div>
      </div>
    );
  }

  if (driverStatus === 'pending') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <img 
            src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png" 
            alt="SafeDrop Logo" 
            className="mx-auto h-20 w-auto mb-4" 
          />
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary mt-4">طلبك قيد المراجعة</h2>
          <p className="text-gray-600 mt-4">
            شكراً لتسجيلك كسائق في منصة سيف دروب. طلبك قيد المراجعة حالياً من قبل فريق الإدارة.
            سيتم إشعارك عبر البريد الإلكتروني بمجرد الموافقة على طلبك.
          </p>
          <div className="mt-8">
            <Button 
              onClick={handleLogout} 
              className="bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (driverStatus === 'rejected') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <img 
            src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png" 
            alt="SafeDrop Logo" 
            className="mx-auto h-20 w-auto mb-4" 
          />
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mt-4">تم رفض طلبك</h2>
          <p className="text-gray-600 mt-4">
            للأسف، تم رفض طلب انضمامك كسائق في منصة سيف دروب.
          </p>
          {rejectionReason && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800">سبب الرفض:</h3>
              <p className="text-red-700 mt-2">{rejectionReason}</p>
            </div>
          )}
          <p className="text-gray-600 mt-4">يمكنك تعديل بياناتك وإعادة التقديم مرة واحدة فقط.</p>
          {canReapply && (
            <Button onClick={handleReapply} className="bg-safedrop-gold hover:bg-safedrop-gold/90 mt-4">
              إعادة التقديم
            </Button>
          )}
          {!canReapply && (
            <p className="mt-4 text-red-600 font-semibold">
              لا يمكنك إعادة التقديم مرة أخرى. يرجى التواصل مع الدعم الفني.
            </p>
          )}
          <div className="mt-6">
            <Button 
              onClick={handleLogout} 
              className="bg-gray-200 text-gray-700 hover:bg-gray-300 w-full"
              variant="outline"
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (driverStatus === 'frozen') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <img 
            src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png" 
            alt="SafeDrop Logo" 
            className="mx-auto h-20 w-auto mb-4" 
          />
          <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-red-700" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 mt-4">الحساب مجمد مؤقتاً</h2>
          <p className="text-red-700 mt-4 px-4">
            تم رفض طلبك كسائق مرتين متتاليتين. يرجى التواصل مع الدعم الفني لتقديم اعتراض أو استفسار.
          </p>
          <div className="mt-6">
            <Button 
              onClick={handleLogout} 
              className="bg-gray-200 text-gray-700 hover:bg-gray-300 w-full"
              variant="outline"
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null; // Should not reach here
};

const PendingApproval = () => {
  return (
    <LanguageProvider>
      <PendingApprovalContent />
    </LanguageProvider>
  );
};

export default PendingApproval;
