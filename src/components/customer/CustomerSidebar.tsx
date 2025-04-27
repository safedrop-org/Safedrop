
import { LayoutDashboard, Package, PlusCircle, UserIcon, Settings, LogOut, CreditCard, MessageSquare, Star, Menu } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';
import { useLanguage } from '@/components/ui/language-context';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const CustomerSidebar = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: language === 'ar' ? "لوحة المعلومات" : "Dashboard",
      path: "/customer/dashboard"
    },
    {
      icon: <PlusCircle className="h-5 w-5" />,
      label: language === 'ar' ? "طلب جديد" : "New Order",
      path: "/customer/create-order"
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: language === 'ar' ? "طلباتي" : "My Orders",
      path: "/customer/orders"
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: language === 'ar' ? "الفواتير والدفع" : "Billing & Payment",
      path: "/customer/billing"
    },
    {
      icon: <UserIcon className="h-5 w-5" />,
      label: language === 'ar' ? "الملف الشخصي" : "Profile",
      path: "/customer/profile"
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: language === 'ar' ? "الدعم الفني" : "Technical Support",
      path: "/customer/support"
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: language === 'ar' ? "التقييم والملاحظات" : "Feedback & Rating",
      path: "/customer/feedback"
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: language === 'ar' ? "الإعدادات" : "Settings",
      path: "/customer/settings"
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
          <div className="p-4">
            <Link to="/">
              <img 
                src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png" 
                alt="SafeDrop Logo" 
                className="h-10" 
              />
              <div className="text-center mt-2 font-bold">{language === 'ar' ? 'سيف دروب' : 'SafeDrop'}</div>
            </Link>
          </div>
          
          <nav className="flex-1">
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
          
          <div className="p-4 border-t border-white/10">
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full bg-white text-safedrop-primary hover:bg-gray-100 hover:text-safedrop-primary flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('logout')}</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // النسخة الخاصة بأجهزة سطح المكتب
  const DesktopSidebar = () => (
    <div className="hidden md:flex bg-safedrop-primary text-white min-h-screen w-64 shadow-lg flex-col">
      <div className="p-4">
        <Link to="/">
          <img 
            src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png" 
            alt="SafeDrop Logo" 
            className="h-10" 
          />
          <div className="text-center mt-2 font-bold">{language === 'ar' ? 'سيف دروب' : 'SafeDrop'}</div>
        </Link>
      </div>
      
      <nav className="flex-1">
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
      
      <div className="mt-auto">
        <div className="p-4 border-t border-white/10">
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="w-full bg-white text-safedrop-primary hover:bg-gray-100 hover:text-safedrop-primary flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('logout')}</span>
          </Button>
        </div>
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

export default CustomerSidebar;
