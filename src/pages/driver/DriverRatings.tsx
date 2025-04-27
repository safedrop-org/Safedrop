
import { useState } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, TrendingUp, MessageSquare } from 'lucide-react';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useDriverRatings } from '@/hooks/useDriverRatings';

const DriverRatingsContent = () => {
  const { t } = useLanguage();
  const { data: ratings, isLoading, error } = useDriverRatings();

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <p>Loading ratings...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <p>Error loading ratings: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">التقييمات</h1>
              <SidebarTrigger />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>تقييماتي</CardTitle>
              </CardHeader>
              <CardContent>
                {ratings && ratings.length > 0 ? (
                  ratings.map((rating) => (
                    <div key={rating.id} className="mb-4 p-4 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-500 mr-2" />
                          <p className="text-lg font-semibold">{rating.rating}</p>
                        </div>
                        <p className="text-gray-500">{rating.created_at}</p>
                      </div>
                      <p className="mt-2 text-gray-700">{rating.comment}</p>
                    </div>
                  ))
                ) : (
                  <p>لا يوجد تقييمات حتى الآن.</p>
                )}
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
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <DriverRatingsContent />
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
};

export default DriverRatings;
