
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/ui/language-context';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-safedrop-primary text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/921d22da-3d5c-4dd1-af5f-458968c49478.png" 
                alt="SafeDrop Logo" 
                className="h-10 w-auto" 
              />
              <span className="ml-2 text-xl font-bold rtl:mr-2 rtl:ml-0">
                {t('siteTitle')}
              </span>
            </Link>
            <p className="text-sm mb-4">
              {t('tagline')}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="text-white hover:text-safedrop-gold transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-safedrop-gold transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-safedrop-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-safedrop-gold transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
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

          {/* Service Areas */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">{t('services')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-gray-300 hover:text-safedrop-gold transition-colors text-sm">
                  خدمة توصيل الطرود
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-safedrop-gold transition-colors text-sm">
                  خدمة حماية المعاملات
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-safedrop-gold transition-colors text-sm">
                  خدمة تتبع الشحنات
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-safedrop-gold transition-colors text-sm">
                  خدمة التوصيل السريع
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">{t('contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="mr-2 h-5 w-5 text-safedrop-gold shrink-0 rtl:ml-2 rtl:mr-0" />
                <span className="text-sm">المملكة العربية السعودية، الرياض</span>
              </li>
              <li className="flex items-start">
                <Phone className="mr-2 h-5 w-5 text-safedrop-gold shrink-0 rtl:ml-2 rtl:mr-0" />
                <span className="text-sm" dir="ltr">+966 50 123 4567</span>
              </li>
              <li className="flex items-start">
                <Mail className="mr-2 h-5 w-5 text-safedrop-gold shrink-0 rtl:ml-2 rtl:mr-0" />
                <span className="text-sm">info@safedrop.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-center text-sm text-gray-400">
            {t('footer')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
