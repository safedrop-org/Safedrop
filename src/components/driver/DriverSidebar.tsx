
import { LayoutDashboard, Package, Truck, UserIcon, Settings, LogOut, Star, DollarSign, Bell, HelpCircle, MessageSquare } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/ui/language-context';

const DriverSidebar = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('driverAuth');
    navigate('/login');
  };

  const menuItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "لوحة المعلومات",
      path: "/driver/dashboard"
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: "الطلبات",
      path: "/driver/orders"
    },
    {
      icon: <Truck className="h-5 w-5" />,
      label: "مركبتي",
      path: "/driver/vehicle"
    },
    {
      icon: <UserIcon className="h-5 w-5" />,
      label: "الملف الشخصي",
      path: "/driver/profile"
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: "التقييمات",
      path: "/driver/ratings"
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: "الأرباح",
      path: "/driver/earnings"
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: "الإشعارات",
      path: "/driver/notifications"
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: "الدعم والمساعدة",
      path: "/driver/support"
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "الإعدادات",
      path: "/driver/settings"
    }
  ];

  return (
    <div className="bg-safedrop-primary text-white min-h-screen w-64 shadow-lg flex flex-col">
      <div className="p-4 flex items-center justify-center">
        <Link to="/">
          <img 
            src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png" 
            alt="SafeDrop Logo" 
            className="h-10" 
          />
          <div className="text-center mt-2 font-bold">سيف دروب</div>
        </Link>
      </div>
      
      <div className="mt-6 flex-1">
        <nav>
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
      </div>
      
      <div className="p-4 border-t border-white/10">
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="w-full bg-white text-safedrop-primary hover:bg-gray-100 hover:text-safedrop-primary flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </div>
  );
};

export default DriverSidebar;
