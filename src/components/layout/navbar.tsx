
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogIn, Play, Box, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/ui/language-context';

const Navbar = () => {
  const {
    t,
    language,
    setLanguage
  } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };
  return <nav className="bg-safedrop-primary text-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img alt="SafeDrop" className="h-14 w-auto" src="/lovable-uploads/7dd0ecee-8381-468b-81d8-ffcbb81319f9.png" />
              </Link>
            </div>
            <div className={`hidden md:block ${language === 'ar' ? 'mr-10' : 'ml-10'}`}>
              <div className="flex items-baseline space-x-6 rtl:space-x-reverse">
                <Link to="/" className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:text-safedrop-gold transition-colors">
                  <Play className="h-5 w-5 mb-1 mr-2" />
                  {t('getStarted')}
                </Link>
                <Link to="/services" className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:text-safedrop-gold transition-colors">
                  <Box className="h-5 w-5 mb-1 mr-2" />
                  {t('services')}
                </Link>
                <Link to="/about" className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:text-safedrop-gold transition-colors">
                  <Users className="h-5 w-5 mb-1 mr-2" />
                  {t('about')}
                </Link>
                <Link to="/contact" className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:text-safedrop-gold transition-colors">
                  <Mail className="h-5 w-5 mb-1 mr-2" />
                  {t('contact')}
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center ml-4 space-x-3 rtl:space-x-reverse">
              <Button variant="ghost" onClick={toggleLanguage} className="text-white">
                {language === 'ar' ? 'English' : 'العربية'}
              </Button>
              <Link to="/login">
                <Button variant="outline" className="border-safedrop-gold text-safedrop-gold hover:bg-safedrop-gold hover:text-white">
                  <LogIn className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t('login')}
                </Button>
              </Link>
              <div className="relative group">
                <Button variant="default" className="bg-safedrop-gold hover:bg-safedrop-gold/90">
                  <User className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t('register')}
                  <ChevronDown className="h-4 w-4 ml-1 rtl:mr-1 rtl:ml-0" />
                </Button>
                <div className="absolute z-10 hidden group-hover:block pt-2 right-0 rtl:left-0 rtl:right-auto min-w-[180px]">
                  <div className="bg-white shadow-lg rounded-md py-2">
                    <Link to="/register/customer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      {t('customerRegister')}
                    </Link>
                    <Link to="/register/driver" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      {t('driverRegister')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex md:hidden">
            <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-safedrop-primary hover:bg-opacity-75" aria-controls="mobile-menu" aria-expanded="false" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-safedrop-primary hover:bg-opacity-75">
              {t('getStarted')}
            </Link>
            <Link to="/services" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-safedrop-primary hover:bg-opacity-75">
              {t('services')}
            </Link>
            <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-safedrop-primary hover:bg-opacity-75">
              {t('about')}
            </Link>
            <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-safedrop-primary hover:bg-opacity-75">
              {t('contact')}
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <div className="flex items-center px-5">
              <Button variant="ghost" onClick={toggleLanguage} className="w-full justify-center text-white">
                {language === 'ar' ? 'English' : 'العربية'}
              </Button>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-safedrop-primary hover:bg-opacity-75">
                {t('login')}
              </Link>
              <Link to="/register/customer" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-safedrop-primary hover:bg-opacity-75">
                {t('customerRegister')}
              </Link>
              <Link to="/register/driver" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-safedrop-primary hover:bg-opacity-75">
                {t('driverRegister')}
              </Link>
            </div>
          </div>
        </div>}
    </nav>;
};
export default Navbar;
