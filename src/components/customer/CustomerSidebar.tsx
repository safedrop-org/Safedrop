
import { LayoutDashboard, Package, PlusCircle, UserIcon, Settings, LogOut, CreditCard, MessageSquare, Star } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';
import { useLanguage } from '@/components/ui/language-context';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const CustomerSidebar = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

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

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link to="/" className="flex flex-col items-center">
          <img 
            src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png" 
            alt="SafeDrop Logo" 
            className="h-10" 
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

export default CustomerSidebar;
