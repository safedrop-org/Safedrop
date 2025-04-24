
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { Star } from 'lucide-react';

const DriverRatingsContent = () => {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">التقييمات</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>متوسط التقييم</span>
                  <div className="flex items-center">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold mr-2">4.8</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded">
                        <div className="h-2 bg-yellow-400 rounded" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                    <span className="ml-2 w-12 text-sm">5 نجوم</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded">
                        <div className="h-2 bg-yellow-400 rounded" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                    <span className="ml-2 w-12 text-sm">4 نجوم</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded">
                        <div className="h-2 bg-yellow-400 rounded" style={{ width: '20%' }}></div>
                      </div>
                    </div>
                    <span className="ml-2 w-12 text-sm">3 نجوم</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded">
                        <div className="h-2 bg-yellow-400 rounded" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                    <span className="ml-2 w-12 text-sm">2 نجوم</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="h-2 bg-gray-200 rounded">
                        <div className="h-2 bg-yellow-400 rounded" style={{ width: '5%' }}></div>
                      </div>
                    </div>
                    <span className="ml-2 w-12 text-sm">1 نجمة</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>آخر التقييمات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, starIndex) => (
                              <Star 
                                key={starIndex} 
                                className={`h-4 w-4 ${starIndex < 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">طلب #123{index}</p>
                        </div>
                        <span className="text-sm text-gray-500">منذ 3 أيام</span>
                      </div>
                      <p className="text-gray-700">خدمة ممتازة وتوصيل سريع</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverRatings = () => {
  return (
    <LanguageProvider>
      <DriverRatingsContent />
    </LanguageProvider>
  );
};

export default DriverRatings;
