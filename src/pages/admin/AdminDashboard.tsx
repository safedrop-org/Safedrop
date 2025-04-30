import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart2Icon, DollarSignIcon, TruckIcon, UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/ui/language-context';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    orders: 0,
    customers: 0,
    drivers: 0,
    revenue: 0
  });

  useEffect(() => {
    // Check if admin is authenticated
    if (localStorage.getItem('adminAuth') !== 'true') {
      console.log('Admin not authenticated, redirecting to login');
      navigate('/login?redirect=admin', { replace: true });
      return;
    }

    // Simulate loading data
    const timer = setTimeout(() => {
      setStats({
        orders: 128,
        customers: 854,
        drivers: 42,
        revenue: 15840
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminEmail');
      toast.success(t('logoutSuccess'));
      navigate('/login?logout=true', { replace: true });
    } catch (error) {
      console.error("Error during admin logout:", error);
      toast.error(t('logoutError'));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Dashboard'}
            </h1>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse flex space-x-4">
                      <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title={language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
                value={stats.orders}
                icon={<BarChart2Icon className="h-6 w-6 text-white" />}
                color="bg-blue-500"
              />
              <StatCard
                title={language === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}
                value={stats.customers}
                icon={<UsersIcon className="h-6 w-6 text-white" />}
                color="bg-green-500"
              />
              <StatCard
                title={language === 'ar' ? 'إجمالي السائقين' : 'Total Drivers'}
                value={stats.drivers}
                icon={<TruckIcon className="h-6 w-6 text-white" />}
                color="bg-purple-500"
              />
              <StatCard
                title={language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
                value={`${stats.revenue} ${language === 'ar' ? 'ر.س' : 'SAR'}`}
                icon={<DollarSignIcon className="h-6 w-6 text-white" />}
                color="bg-amber-500"
              />
            </div>
          )}

          {/* Additional dashboard content goes here */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
