
import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/ui/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { DriverPageLayout, DriverStatsCard } from '@/components/driver/common';

const DriverEarningsContent = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Array<{
    id: string;
    amount: number;
    created_at: string;
    driver_id: string;
  }>>([]);
  const [summary, setSummary] = useState({
    today: 0,
    weekly: 0,
    monthly: 0
  });

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('driver_earnings')
          .select('*')
          .eq('driver_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setEarnings(data || []);

        // Calculate summaries
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const weekStart = new Date(now.setDate(now.getDate() - 7)).toISOString();
        const monthStart = new Date(now.setDate(now.getDate() - 30)).toISOString();
        
        const todayEarnings = data?.filter(e => e.created_at.startsWith(today)).reduce((sum, e) => sum + Number(e.amount), 0);
        const weeklyEarnings = data?.filter(e => e.created_at >= weekStart).reduce((sum, e) => sum + Number(e.amount), 0);
        const monthlyEarnings = data?.filter(e => e.created_at >= monthStart).reduce((sum, e) => sum + Number(e.amount), 0);
        
        setSummary({
          today: todayEarnings,
          weekly: weeklyEarnings,
          monthly: monthlyEarnings
        });
      } catch (error) {
        console.error('Error fetching earnings:', error);
      }
    };
    
    fetchEarnings();
  }, [user]);

  // Prepare chart data
  const chartData = earnings.slice(0, 7).map(earning => ({
    name: format(new Date(earning.created_at), 'dd/MM'),
    amount: Number(earning.amount)
  })).reverse();

  const currencySymbol = t('currency');
  
  return (
    <DriverPageLayout title={t('earnings')}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DriverStatsCard
          title={t('todayEarnings')}
          value={summary.today}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          currency={true}
        />

        <DriverStatsCard
          title={t('weeklyEarnings')}
          value={summary.weekly}
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          currency={true}
        />

        <DriverStatsCard
          title={t('monthlyEarnings')}
          value={summary.monthly}
          icon={Calendar}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          currency={true}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">{t('earningsAnalysis')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} ${currencySymbol}`, t('totalEarnings')]} />
                <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        {/* Additional earnings information could go here */}
      </Card>
    </DriverPageLayout>
  );
};

const DriverEarnings = () => {
  return <DriverEarningsContent />;
};

export default DriverEarnings;
