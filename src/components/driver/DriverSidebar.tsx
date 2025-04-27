
import { LayoutDashboard, Package, UserIcon, Settings, LogOut, Star, DollarSign, Bell, HelpCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/ui/language-context';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";

const DriverSidebar = () => {
  const { t, language } = useLanguage();
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
      label: language === 'ar' ? "لوحة المعلومات" : "Dashboard",
      path: "/driver/dashboard"
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: language === 'ar' ? "الطلبات" : "Orders",
      path: "/driver/orders"
    },
    {
      icon: <UserIcon className="h-5 w-5" />,
      label: language === 'ar' ? "الملف الشخصي" : "Profile",
      path: "/driver/profile"
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: language === 'ar' ? "التقييمات" : "Ratings",
      path: "/driver/ratings"
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: language === 'ar' ? "الأرباح" : "Earnings",
      path: "/driver/earnings"
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: language === 'ar' ? "الإشعارات" : "Notifications",
      path: "/driver/notifications"
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: language === 'ar' ? "الدعم والمساعدة" : "Support & Help",
      path: "/driver/support"
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: language === 'ar' ? "الإعدادات" : "Settings",
      path: "/driver/settings"
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link to="/" className="flex flex-col items-center">
          <img 
            src="/lovable-uploads/78b0a264-3066-4690-bdc3-775d48ad5001.png" 
            alt="SafeDrop Logo" 
            className="h-20" 
          />
          <div className="text-center mt-2 font-bold text-white">
            {language === 'ar' ? 'سيف دروب' : 'SafeDrop'}
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.path)}
                className="w-full"
              >
                <Link
                  to={item.path}
                  className="flex items-center gap-3 w-full"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-white/10">
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="w-full bg-white text-safedrop-primary hover:bg-gray-100 hover:text-safedrop-primary flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>{t('logout')}</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DriverSidebar;
