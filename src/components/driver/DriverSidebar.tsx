import { LayoutDashboard, Package, UserIcon, Settings, LogOut, Star, DollarSign, Bell, HelpCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/ui/language-context';
import LanguageToggleDashboard from '../ui/language-toggle-dashboard';

const DriverSidebar = () => {
  const {
    t
  } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  const handleLogout = () => {
    localStorage.removeItem('driverAuth');
    navigate('/login');
  };
  const menuItems = [{
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "لوحة المعلومات",
    path: "/driver/dashboard"
  }, {
    icon: <Package className="h-5 w-5" />,
    label: "الطلبات",
    path: "/driver/orders"
  }, {
    icon: <UserIcon className="h-5 w-5" />,
    label: "الملف الشخصي",
    path: "/driver/profile"
  }, {
    icon: <Star className="h-5 w-5" />,
    label: "التقييمات",
    path: "/driver/ratings"
  }, {
    icon: <DollarSign className="h-5 w-5" />,
    label: "الأرباح",
    path: "/driver/earnings"
  }, {
    icon: <Bell className="h-5 w-5" />,
    label: "الإشعارات",
    path: "/driver/notifications"
  }, {
    icon: <HelpCircle className="h-5 w-5" />,
    label: "الدعم والمساعدة",
    path: "/driver/support"
  }, {
    icon: <Settings className="h-5 w-5" />,
    label: "الإعدادات",
    path: "/driver/settings"
  }];

  return (
    <div className="bg-safedrop-primary text-white min-h-screen w-64 shadow-lg flex flex-col">
      <div className="p-4 flex items-center justify-center">
        <Link to="/">
          <img alt="SafeDrop Logo" src="/lovable-uploads/78b0a264-3066-4690-bdc3-775d48ad5001.png" className="h-20" />
          <div className="text-center mt-2 font-bold">سيف دروب</div>
        </Link>
      </div>
      
      <div className="mt-6 flex-1">
        <nav>
          <ul>
            {menuItems.map((item, index) => <li key={index}>
                <Link to={item.path} className={`flex items-center gap-3 px-6 py-3 hover:bg-white/10 transition-colors ${isActive(item.path) ? 'bg-white/10 border-r-4 border-safedrop-gold' : ''}`}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>)}
          </ul>
        </nav>
      </div>
      
      <div className="mt-auto">
        <div className="p-4 border-t border-white/10">
          <LanguageToggleDashboard />
        </div>
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
};

export default DriverSidebar;
