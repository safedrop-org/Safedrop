
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ClockIcon, LogOutIcon } from 'lucide-react';

const PendingApprovalContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [driverStatus, setDriverStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  
  useEffect(() => {
    const checkDriverStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        // Fetch driver status
        const { data: driver, error } = await supabase
          .from('drivers')
          .select('status, rejection_reason')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (driver) {
          setDriverStatus(driver.status as 'pending' | 'approved' | 'rejected');
          setRejectionReason(driver.rejection_reason || null);
          
          // If approved, redirect to dashboard
          if (driver.status === 'approved') {
            navigate('/driver/dashboard');
          }
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
    navigate('/login');
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
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8">
        <div className="text-center">
          <img 
            src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png" 
            alt="SafeDrop Logo" 
            className="mx-auto h-20 w-auto mb-4" 
          />
          
          {driverStatus === 'pending' && (
            <>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-safedrop-primary mt-4">طلبك قيد المراجعة</h2>
              <p className="text-gray-600 mt-4">
                شكراً لتسجيلك كسائق في منصة سيف دروب. طلبك قيد المراجعة حالياً من قبل فريق الإدارة.
                سيتم إشعارك عبر البريد الإلكتروني بمجرد الموافقة على طلبك.
              </p>
            </>
          )}
          
          {driverStatus === 'rejected' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <LogOutIcon className="h-8 w-8 text-red-600" />
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
              <p className="text-gray-600 mt-4">
                يمكنك التواصل مع فريق الدعم للمزيد من المعلومات.
              </p>
            </>
          )}
          
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
    </div>
  );
};

const PendingApproval = () => {
  return (
    <LanguageProvider>
      <PendingApprovalContent />
    </LanguageProvider>
  );
};

export default PendingApproval;
