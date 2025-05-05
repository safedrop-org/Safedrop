
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/components/ui/language-context';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, PackageOpen, User, DollarSign, BellRing, HelpCircle, Star, Settings, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DriverSidebar = () => {
  const { language, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isClientSide, setIsClientSide] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Handle client-side rendering for mobile detection
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { name: language === 'ar' ? 'لوحة التحكم' : 'Dashboard', path: '/driver/dashboard', icon: <Menu className="h-5 w-5" /> },
    { name: language === 'ar' ? 'الطلبات' : 'Orders', path: '/driver/orders', icon: <PackageOpen className="h-5 w-5" /> },
    { name: language === 'ar' ? 'الملف الشخصي' : 'Profile', path: '/driver/profile', icon: <User className="h-5 w-5" /> },
    { name: language === 'ar' ? 'التقييمات' : 'Ratings', path: '/driver/ratings', icon: <Star className="h-5 w-5" /> },
    { name: language === 'ar' ? 'الأرباح' : 'Earnings', path: '/driver/earnings', icon: <DollarSign className="h-5 w-5" /> },
    { name: language === 'ar' ? 'الإشعارات' : 'Notifications', path: '/driver/notifications', icon: <BellRing className="h-5 w-5" /> },
    { name: language === 'ar' ? 'الدعم' : 'Support', path: '/driver/support', icon: <HelpCircle className="h-5 w-5" /> },
    { name: language === 'ar' ? 'الإعدادات' : 'Settings', path: '/driver/settings', icon: <Settings className="h-5 w-5" /> },
    { name: language === 'ar' ? 'الأسئلة الأمنية' : 'Security Questions', path: '/driver/security-questions', icon: <Shield className="h-5 w-5" /> },
    { name: language === 'ar' ? 'تسجيل الخروج' : 'Logout', path: '/driver/logout', icon: <LogOut className="h-5 w-5" /> }
  ];

  // الشكل الجديد للقائمة الجانبية
  const getSidebarContent = () => (
    <div className={`h-full flex flex-col ${language === 'ar' ? 'rtl' : 'ltr'} bg-safedrop-primary text-white`}>
      <div className="p-4 border-b flex justify-center items-center">
        <h2 className="text-xl font-bold text-center">
          {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </h2>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="flex flex-col items-end px-2 space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => {
                  if (item.path === '/driver/logout') {
                    handleLogout();
                  }
                  setIsMobileOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3 py-3 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-safedrop-gold' 
                    : 'hover:bg-white/10'
                }`}
              >
                <span className="flex-1 text-right">{item.name}</span>
                {item.icon}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full justify-center gap-2 border-white/30 text-white hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
        </Button>
      </div>
    </div>
  );

  // For mobile: render Sheet component
  if (isClientSide && window.innerWidth < 768) {
    return (
      <>
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-safedrop-primary px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
                <span className="sr-only">
                  {language === 'ar' ? 'فتح القائمة' : 'Open sidebar'}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side={language === 'ar' ? 'left' : 'right'} className="p-0 w-64">
              {getSidebarContent()}
            </SheetContent>
          </Sheet>
          
          <div className="flex-1 text-sm font-semibold leading-6 text-white">
            SafeDrop
          </div>
        </div>
      </>
    );
  }

  // For desktop: render normal sidebar
  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
      {getSidebarContent()}
    </div>
  );
};

export default DriverSidebar;
