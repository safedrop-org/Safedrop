
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  CreditCard, 
  User, 
  MessageSquare, 
  Star, 
  Settings,
  PlusCircle
} from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';

const CustomerSidebar = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    {
      path: '/customer/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard'
    },
    {
      path: '/customer/create-order',
      icon: <PlusCircle className="h-5 w-5" />,
      label: 'New Order'
    },
    {
      path: '/customer/my-orders',
      icon: <Package className="h-5 w-5" />,
      label: 'My Orders'
    },
    {
      path: '/customer/billing',
      icon: <CreditCard className="h-5 w-5" />,
      label: 'Billing & Payment'
    },
    {
      path: '/customer/profile',
      icon: <User className="h-5 w-5" />,
      label: 'Profile'
    },
    {
      path: '/customer/support',
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'Technical Support'
    },
    {
      path: '/customer/feedback',
      icon: <Star className="h-5 w-5" />,
      label: 'Feedback & Rating'
    },
    {
      path: '/customer/settings',
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="bg-safedrop-primary text-white w-64 h-screen flex flex-col">
      <div className="p-4 flex items-center gap-2">
        <img 
          src="/lovable-uploads/22505526-01af-462e-9607-5608858ab5c6.png" 
          alt="SafeDrop Logo" 
          className="h-8 w-8"
        />
        <h1 className="text-xl font-bold">SafeDrop</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-white/10 font-medium'
                    : 'hover:bg-white/5'
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
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default CustomerSidebar;
