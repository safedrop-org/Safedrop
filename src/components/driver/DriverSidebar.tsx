
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/components/ui/language-context';
import LanguageToggleDashboard from "@/components/ui/language-toggle-dashboard";
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, PackageOpen, User, DollarSign, BellRing, HelpCircle, Star, Settings, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

const DriverSidebar = () => {
  const { language, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
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
    { name: t('Dashboard'), path: '/driver/dashboard', icon: <Menu className="h-5 w-5" /> },
    { name: t('Orders'), path: '/driver/orders', icon: <PackageOpen className="h-5 w-5" /> },
    { name: t('Profile'), path: '/driver/profile', icon: <User className="h-5 w-5" /> },
    { name: t('Ratings'), path: '/driver/ratings', icon: <Star className="h-5 w-5" /> },
    { name: t('Earnings'), path: '/driver/earnings', icon: <DollarSign className="h-5 w-5" /> },
    { name: t('Notifications'), path: '/driver/notifications', icon: <BellRing className="h-5 w-5" /> },
    { name: t('Support'), path: '/driver/support', icon: <HelpCircle className="h-5 w-5" /> },
    { name: t('Settings'), path: '/driver/settings', icon: <Settings className="h-5 w-5" /> },
    { name: t('securityQuestions'), path: '/driver/security-questions', icon: <Shield className="h-5 w-5" /> },
    { name: t('Logout'), path: '/driver/logout', icon: <LogOut className="h-5 w-5" /> }
  ];

  const getFullName = () => {
    if (profile) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return 'Driver';
  };

  const getSidebarContent = () => (
    <div className="h-full flex flex-col bg-white border-r" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.profile_image} />
            <AvatarFallback className="bg-safedrop-primary text-white">
              {profile ? getInitials(`${profile.first_name} ${profile.last_name}`) : 'SD'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{getFullName()}</h2>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="px-2 space-y-1">
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
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-safedrop-gold text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t">
        <LanguageToggleDashboard />
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
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-64">
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
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      {getSidebarContent()}
    </div>
  );
};

export default DriverSidebar;
