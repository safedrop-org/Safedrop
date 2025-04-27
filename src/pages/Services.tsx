
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Shield, Truck, Package, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ServicesContent = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-safedrop-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('servicesHeroTitle')}</h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              {t('servicesHeroDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-safedrop-gold hover:bg-safedrop-gold/90 text-white">
                <Link to="/register/customer">{t('registerAsCustomer')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white">
                <Link to="/register/driver">{t('registerAsDriver')}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Package className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t('parcelDelivery')}</h3>
                  <p className="text-gray-600 mb-4">{t('parcelDeliveryDescription')}</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{t('allAreas')}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{t('securePacking')}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{t('directDelivery')}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Shield className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t('transactionProtection')}</h3>
                  <p className="text-gray-600 mb-4">{t('transactionProtectionDescription')}</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{t('fraudProtection')}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{t('paymentConfirmation')}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{t('trustedSystem')}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Clock className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t('expressDelivery')}</h3>
                  <p className="text-gray-600 mb-4">{t('expressDeliveryDescription')}</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{t('sameDayDelivery')}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{t('executionPriority')}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{t('suitableForUrgentOrders')}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Truck className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t('verifiedDrivers')}</h3>
                  <p className="text-gray-600 mb-4">{t('verifiedDriversDescription')}</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{t('licenseVerification')}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{t('executionPriority')}</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{t('suitableForUrgentOrders')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-safedrop-primary mb-6">{t('startWithSafedrop')}</h2>
            <p className="text-xl text-gray-600 mb-8">{t('safeDeliveryExperience')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-safedrop-primary hover:bg-safedrop-primary/90">
                <Link to="/register/customer">{t('registerAsCustomer')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-safedrop-primary text-safedrop-primary hover:bg-safedrop-primary hover:text-white">
                <Link to="/register/driver">{t('registerAsDriver')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const Services = () => {
  return (
    <LanguageProvider>
      <ServicesContent />
    </LanguageProvider>
  );
};

export default Services;
