
import { useLanguage } from '@/components/ui/language-context';
import { UsersIcon, TruckIcon, PackageIcon, BarChart2Icon, SettingsIcon, ShieldIcon, DollarSign, MessageSquareIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import LanguageToggleDashboard from '../ui/language-toggle-dashboard';

const AdminSidebar = () => {
  const { t, language } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
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
    <div className="bg-safedrop-primary text-white min-h-screen w-64 shadow-lg">
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <ShieldIcon className="h-6 w-6 text-safedrop-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{language === 'ar' ? 'سيف دروب' : 'SafeDrop'}</h2>
          <p className="text-xs opacity-75">{language === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Dashboard'}</p>
        </div>
      </div>
      
      <div className="mt-6">
        <nav>
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-6 py-3 hover:bg-white/10 transition-colors ${
                    (isActive(item.path) || 
                     (item.path === '/admin/dashboard' && location.pathname === '/admin')) ? 
                    'bg-white/10 border-r-4 border-safedrop-gold' : ''
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

      <div className="mt-auto p-4 border-t border-white/10">
        <LanguageToggleDashboard />
      </div>
    </div>
  );
};

export default AdminSidebar;
