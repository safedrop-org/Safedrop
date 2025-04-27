
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { Phone, Mail, HelpCircle } from 'lucide-react';

const DriverSupportContent = () => {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">{t('supportTitle')}</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-medium mb-2">{t('callUs')}</h3>
                    <p className="text-sm text-gray-500 mb-4">{t('contactPhone')}</p>
                    <Button variant="outline" className="w-full">{t('callUs')}</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <Mail className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium mb-2">{t('emailSupport')}</h3>
                    <p className="text-sm text-gray-500 mb-4">{t('contactEmail')}</p>
                    <Button variant="outline" className="w-full">{t('emailSupport')}</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('faqTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <button className="flex justify-between items-center w-full text-right">
                      <span className="font-medium">{t('updateVehicleInfo')}</span>
                      <HelpCircle className="h-5 w-5 text-gray-400" />
                    </button>
                    <p className="mt-2 text-gray-600 text-sm">
                      {t('updateVehicleAnswer')}
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <button className="flex justify-between items-center w-full text-right">
                      <span className="font-medium">{t('earningsTransfer')}</span>
                      <HelpCircle className="h-5 w-5 text-gray-400" />
                    </button>
                    <p className="mt-2 text-gray-600 text-sm">
                      {t('earningsTransferAnswer')}
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <button className="flex justify-between items-center w-full text-right">
                      <span className="font-medium">{t('reportIssueQuestion')}</span>
                      <HelpCircle className="h-5 w-5 text-gray-400" />
                    </button>
                    <p className="mt-2 text-gray-600 text-sm">
                      {t('reportIssueAnswer')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverSupport = () => {
  return (
    <LanguageProvider>
      <DriverSupportContent />
    </LanguageProvider>
  );
};

export default DriverSupport;
