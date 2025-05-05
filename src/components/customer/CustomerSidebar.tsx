
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { LayoutDashboard, Package, CreditCard, User, MessageSquare, Star, Settings, PlusCircle, LogOut, ShieldQuestion } from 'lucide-react';
import { useLanguage } from '@/components/ui/language-context';

const CustomerSidebar = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const menuItems = [
    {
      path: '/customer/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: t('Dashboard')
    },
    {
      path: '/customer/create-order',
      icon: <PlusCircle className="h-5 w-5" />,
      label: t('New Order')
    },
    {
      path: '/customer/orders',
      icon: <Package className="h-5 w-5" />,
      label: t('My Orders')
    },
    {
      path: '/customer/billing',
      icon: <CreditCard className="h-5 w-5" />,
      label: t('Billing & Payment')
    },
    {
      path: '/customer/profile',
      icon: <User className="h-5 w-5" />,
      label: t('Profile')
    },
    {
      path: '/customer/support',
      icon: <MessageSquare className="h-5 w-5" />,
      label: t('Technical Support')
    },
    {
      path: '/customer/feedback',
      icon: <Star className="h-5 w-5" />,
      label: t('Feedback & Rating')
    },
    {
      path: '/customer/security-questions',
      icon: <ShieldQuestion className="h-5 w-5" />,
      label: t('securityQuestions')
    },
    {
      path: '/customer/settings',
      icon: <Settings className="h-5 w-5" />,
      label: t('Settings')
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    navigate('/customer/logout');
  };

  return (
    <aside className="bg-safedrop-primary text-white w-64 h-screen flex flex-col">
      <div className="p-4 flex items-center gap-2">
        <img 
          alt="SafeDrop Logo" 
          className="h-8 w-8" 
          src="/lovable-uploads/23d24828-2c22-46a3-a28c-04dc362e92cd.png" 
        />
        <h1 className="text-xl font-bold">SafeDrop</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors ${
                  isActive(item.path) ? 'bg-white/10 font-medium' : 'hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full gap-2 py-2 px-4 rounded-md border border-white/20 hover:bg-white/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>{t('Logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default CustomerSidebar;
