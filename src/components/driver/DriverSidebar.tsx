
import { LayoutDashboard, Package, UserIcon, Settings, LogOut, Star, DollarSign, Bell, HelpCircle, Menu, ShieldQuestion } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/components/ui/language-context';
import { useAuth } from '@/components/auth/AuthContext';

const DriverSidebar = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    navigate('/driver/logout');
  };

  const menuItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: t('dashboard'),
      path: "/driver/dashboard"
    }, {
      icon: <Package className="h-5 w-5" />,
      label: t('orders'),
      path: "/driver/orders"
    }, {
      icon: <UserIcon className="h-5 w-5" />,
      label: t('Profile'),
      path: "/driver/profile"
    }, {
      icon: <Star className="h-5 w-5" />,
      label: t('ratings'),
      path: "/driver/ratings"
    }, {
      icon: <DollarSign className="h-5 w-5" />,
      label: t('earnings'),
      path: "/driver/earnings"
    }, {
      icon: <Bell className="h-5 w-5" />,
      label: t('notifications'),
      path: "/driver/notifications"
    }, {
      icon: <HelpCircle className="h-5 w-5" />,
      label: t('support'),
      path: "/driver/support"
    }, {
      icon: <ShieldQuestion className="h-5 w-5" />,
      label: t('securityQuestions'),
      path: "/driver/security-questions"
    }, {
      icon: <Settings className="h-5 w-5" />,
      label: t('Settings'),
      path: "/driver/settings"
    }, {
      icon: <LogOut className="h-5 w-5" />,
      label: t('Logout'),
      path: "/driver/logout",
      onClick: handleLogout,
      isButton: true
    }
  ];

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden fixed top-4 right-4 z-50" 
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">{t('toggleMenu')}</span>
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-[280px] sm:w-[340px] p-0">
          <div className="bg-safedrop-primary text-white h-full flex flex-col">
            <div className="p-4">
              <Link to="/" className="flex flex-col items-center">
                <img 
                  alt={t('siteTitle')} 
                  src="/lovable-uploads/78b0a264-3066-4690-bdc3-775d48ad5001.png" 
                  className="h-20" 
                />
                <div className="text-center mt-2 font-bold">{t('siteTitle')}</div>
              </Link>
            </div>
            
            <nav className="flex-1">
              <ul>
                {menuItems.map((item, index) => (
                  <li key={index}>
                    {item.isButton ? (
                      <button
                        onClick={item.onClick}
                        className={`flex w-full items-center gap-3 px-6 py-3 hover:bg-white/10 transition-colors text-left ${
                          isActive(item.path) ? 'bg-white/10 border-r-4 border-safedrop-gold' : ''
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ) : (
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
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden md:flex bg-safedrop-primary text-white min-h-screen w-64 shadow-lg flex-col">
        <div className="p-4 flex items-center justify-center">
          <Link to="/">
            <img alt="SafeDrop Logo" className="h-20" src="/lovable-uploads/289fb913-2d65-4eb7-8518-9e5e699f2217.png" />
            <div className="text-center mt-2 font-bold">{t('siteTitle')}</div>
          </Link>
        </div>
        
        <nav className="flex-1">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                {item.isButton ? (
                  <button
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-white/10 transition-colors text-left ${
                      isActive(item.path) ? 'bg-white/10 border-r-4 border-safedrop-gold' : ''
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ) : (
                  <Link 
                    to={item.path} 
                    className={`flex items-center gap-3 px-6 py-3 hover:bg-white/10 transition-colors ${isActive(item.path) ? 'bg-white/10 border-r-4 border-safedrop-gold' : ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default DriverSidebar;
