
import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DriverSidebar from '@/components/driver/DriverSidebar';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

const DriverRatingsContent = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [ratings, setRatings] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingStats, setRatingStats] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('driver_ratings')
          .select(`
            *,
            orders (
              customer_id,
              pickup_location,
              dropoff_location
            )
          `)
          .eq('driver_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setRatings(data || []);

        // Calculate average rating
        if (data && data.length > 0) {
          const avg = data.reduce((acc, curr) => acc + curr.rating, 0) / data.length;
          setAverageRating(Number(avg.toFixed(1)));

          // Calculate rating stats
          const stats = [0, 0, 0, 0, 0];
          data.forEach(rating => {
            stats[rating.rating - 1]++;
          });
          setRatingStats(stats);
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchRatings();
  }, [user]);

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
                    <span className="text-2xl font-bold mr-2">{averageRating}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((stars, index) => {
                    const count = ratingStats[stars - 1];
                    const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
                    
                    return (
                      <div key={stars} className="flex items-center">
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded">
                            <div 
                              className="h-2 bg-yellow-400 rounded" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="ml-2 w-12 text-sm">{stars} نجوم</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>آخر التقييمات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, starIndex) => (
                              <Star 
                                key={starIndex} 
                                className={`h-4 w-4 ${
                                  starIndex < rating.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'fill-gray-200 text-gray-200'
                                }`} 
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">طلب #{rating.order_id}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(rating.created_at), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      {rating.comment && (
                        <p className="text-gray-700">{rating.comment}</p>
                      )}
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
