
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/ui/language-context';
import { MapPin, Mail, Instagram, Video, Ghost } from 'lucide-react';

const Footer = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-safedrop-primary text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1 - Contact Info */}
          <div className="col-span-1 md:order-3">
            <h3 className="text-lg font-semibold mb-4">{t('contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className={`h-5 w-5 text-safedrop-gold shrink-0 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                <span className="text-sm">Saudi Arabia</span>
              </li>
              <li className="flex items-start">
                <Mail className={`h-5 w-5 text-safedrop-gold shrink-0 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                <span className="text-sm" dir="ltr">info@safedropksa.com</span>
              </li>
            </ul>
            <div className={`flex mt-4 ${language === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <a href="https://www.instagram.com/ihalabbad?igsh=MXgydnpwZHZiNXB5aw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-white hover:text-safedrop-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.tiktok.com/@iha.store?_t=ZS-8vshXos9iJm&_r=1" target="_blank" rel="noopener noreferrer" className="text-white hover:text-safedrop-gold transition-colors">
                <Video size={20} />
              </a>
              <a href="https://www.snapchat.com/add/ihalabbad1?share_id=4tDP8fBXbHs&locale=ar-SA" target="_blank" rel="noopener noreferrer" className="text-white hover:text-safedrop-gold transition-colors">
                <Ghost size={20} />
              </a>
            </div>
          </div>

          {/* Column 2 - Services */}
          <div className="col-span-1 md:order-2">
            <h3 className="text-lg font-semibold mb-4">{t('services')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-gray-300 hover:text-safedrop-gold transition-colors text-sm">
                  {t('parcelDelivery')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-safedrop-gold transition-colors text-sm">
                  {t('transactionProtection')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-safedrop-gold transition-colors text-sm">
                  {t('expressDelivery')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-safedrop-gold transition-colors text-sm">
                  {t('verifiedDrivers')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Get Started */}
          <div className="col-span-1 md:order-1">
            <h3 className="text-lg font-semibold mb-4">{t('getStarted')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register/customer" className="text-gray-300 hover:text-safedrop-gold transition-colors text-sm">
                  {t('customerRegister')}
                </Link>
              </li>
              <li>
                <Link to="/register/driver" className="text-gray-300 hover:text-safedrop-gold transition-colors text-sm">
                  {t('driverRegister')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-safedrop-gold transition-colors text-sm">
                  {t('login')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-safedrop-gold transition-colors text-sm">
                  {t('services')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - About */}
          <div className="col-span-1 md:order-0">
            <Link to="/" className="flex items-center mb-4">
              <span className={`text-xl font-bold ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>
                {t('siteTitle')}
              </span>
            </Link>
            <p className="text-sm mb-4">
              {t('tagline')}
            </p>
            <div className={`flex ${language === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              <a href="https://www.instagram.com/ihalabbad?igsh=MXgydnpwZHZiNXB5aw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-white hover:text-safedrop-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://www.tiktok.com/@iha.store?_t=ZS-8vshXos9iJm&_r=1" target="_blank" rel="noopener noreferrer" className="text-white hover:text-safedrop-gold transition-colors">
                <Video size={20} />
              </a>
              <a href="https://www.snapchat.com/add/ihalabbad1?share_id=4tDP8fBXbHs&locale=ar-SA" target="_blank" rel="noopener noreferrer" className="text-white hover:text-safedrop-gold transition-colors">
                <Ghost size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm text-gray-400">
            <Link to="/terms" className="hover:text-safedrop-gold transition-colors">
              Terms & Conditions / الشروط والأحكام
            </Link>
          </div>
          <p className="text-center text-sm text-gray-400" dir="auto">
            © 2025 سيف دروب. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
