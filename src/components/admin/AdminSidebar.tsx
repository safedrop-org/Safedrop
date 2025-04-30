
import { useLanguage } from '@/components/ui/language-context';
import { UsersIcon, TruckIcon, PackageIcon, BarChart2Icon, SettingsIcon, ShieldIcon, DollarSign, MessageSquareIcon, Menu, LogOutIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';

const AdminSidebar = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminEmail');
      toast.success('تم تسجيل الخروج بنجاح');
      navigate('/login?logout=true', { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const menuItems = [
    {
      icon: <BarChart2Icon className="h-5 w-5" />,
      label: language === 'ar' ? "لوحة المعلومات" : "Dashboard",
      path: "/admin/dashboard"
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: language === 'ar' ? "الملخص المالي" : "Financial Summary",
      path: "/admin/finance"
    },
    {
      icon: <TruckIcon className="h-5 w-5" />,
      label: language === 'ar' ? "إدارة السائقين" : "Driver Management",
      path: "/admin/driver-verification"
    },
    {
      icon: <UsersIcon className="h-5 w-5" />,
      label: language === 'ar' ? "إدارة العملاء" : "Customer Management",
      path: "/admin/customers"
    },
    {
      icon: <PackageIcon className="h-5 w-5" />,
      label: language === 'ar' ? "إدارة الطلبات" : "Order Management",
      path: "/admin/orders"
    },
    {
      icon: <MessageSquareIcon className="h-5 w-5" />,
      label: language === 'ar' ? "الشكاوى والدعم" : "Complaints & Support",
      path: "/admin/complaints"
    },
    {
      icon: <SettingsIcon className="h-5 w-5" />,
      label: language === 'ar' ? "الإعدادات" : "Settings",
      path: "/admin/settings"
    }
  ];

  // النسخة الخاصة بالهواتف المحمولة
  const MobileSidebar = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden fixed top-4 right-4 z-50"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">فتح القائمة</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[340px] p-0">
        <div className="bg-safedrop-primary text-white h-full flex flex-col">
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <ShieldIcon className="h-6 w-6 text-safedrop-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{language === 'ar' ? 'سيف دروب' : 'SafeDrop'}</h2>
              <p className="text-xs opacity-75">{language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Dashboard'}</p>
            </div>
          </div>
          
          <nav className="mt-6 flex-1">
            <ul>
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-6 py-3 hover:bg-white/10 transition-colors ${
                      isActive(item.path) ? 'bg-white/10 border-r-4 border-safedrop-gold' : ''
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="mt-auto p-4">
            <Button 
              variant="outline" 
              className="w-full justify-start text-black border-white border-opacity-20 hover:bg-white/10"
              onClick={handleLogout}
            >
              <LogOutIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // النسخة الخاصة بأجهزة سطح المكتب
  const DesktopSidebar = () => (
    <div className="hidden md:block bg-safedrop-primary text-white min-h-screen w-64 shadow-lg flex flex-col">
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <ShieldIcon className="h-6 w-6 text-safedrop-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{language === 'ar' ? 'سيف دروب' : 'SafeDrop'}</h2>
          <p className="text-xs opacity-75">{language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Dashboard'}</p>
        </div>
      </div>
      
      <nav className="mt-6 flex-1">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 hover:bg-white/10 transition-colors ${
                  isActive(item.path) ? 'bg-white/10 border-r-4 border-safedrop-gold' : ''
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="mt-auto p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start text-black border-white border-opacity-20 hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOutIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
          {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  );
};

export default AdminSidebar;
