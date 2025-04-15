
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { useToast } from '@/hooks/use-toast';

const DriverDashboardContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const driverAuth = localStorage.getItem('driverAuth');
    if (!driverAuth || driverAuth !== 'true') {
      toast({
        title: "غير مصرح بالدخول",
        description: "يرجى تسجيل الدخول أولاً",
        variant: "destructive",
      });
      navigate('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate, toast]);

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">لوحة تحكم السائق</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">مرحباً بك في لوحة تحكم السائق</h2>
              <p className="text-gray-600">
                من هنا يمكنك إدارة طلبات التوصيل الخاصة بك ومتابعة إحصائياتك وتحديث ملفك الشخصي.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverDashboard = () => {
  return (
    <LanguageProvider>
      <DriverDashboardContent />
    </LanguageProvider>
  );
};

export default DriverDashboard;
