
import { useLanguage } from '@/components/ui/language-context';
import { UsersIcon, TruckIcon, PackageIcon, BarChart2Icon, SettingsIcon, ShieldIcon, DollarSign, MessageSquareIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const AdminSidebar = () => {
  const { language } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/admin/dashboard' && location.pathname === '/admin');
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

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <ShieldIcon className="h-6 w-6 text-safedrop-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{language === 'ar' ? 'سيف دروب' : 'SafeDrop'}</h2>
            <p className="text-xs text-white/75">{language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Dashboard'}</p>
          </div>
        </div>
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
    </Sidebar>
  );
};

export default AdminSidebar;
