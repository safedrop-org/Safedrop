
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { supabase } from '@/integrations/supabase/client';
import { Package, Clock, CheckCircle, PlusCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';

const CustomerDashboardContent = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    inProgress: 0,
    completed: 0
  });
  const [activeOrders, setActiveOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchDashboardData = async () => {
      try {
        // Fetch orders statistics
        const {
          data: allOrders,
          error: ordersError
        } = await supabase.from('orders').select('id, status').eq('customer_id', user.id);
        if (ordersError) throw ordersError;

        // Calculate stats
        const stats = {
          totalOrders: allOrders ? allOrders.length : 0,
          inProgress: allOrders ? allOrders.filter(order => ['pending', 'assigned', 'in_progress'].includes(order.status)).length : 0,
          completed: allOrders ? allOrders.filter(order => order.status === 'completed').length : 0
        };
        setStats(stats);

        // Fetch active orders with details
        const {
          data: active,
          error: activeError
        } = await supabase.from('orders').select(`
            *,
            driver:profiles!orders_driver_id_fkey(first_name, last_name)
          `).eq('customer_id', user.id).in('status', ['pending', 'assigned', 'in_progress']).order('created_at', {
          ascending: false
        }).limit(5);
        if (activeError) throw activeError;
        setActiveOrders(active || []);

        // Fetch recent history orders
        const {
          data: history,
          error: historyError
        } = await supabase.from('orders').select(`
            *,
            driver:profiles!orders_driver_id_fkey(first_name, last_name)
          `).eq('customer_id', user.id).in('status', ['completed', 'cancelled']).order('created_at', {
          ascending: false
        }).limit(5);
        if (historyError) throw historyError;
        setHistoryOrders(history || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Error loading data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  const handleCreateOrder = () => {
    navigate('/customer/create-order');
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = status => {
    const badgeClasses = {
      base: "px-2 py-1 rounded-full text-xs font-medium",
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      in_progress: "bg-indigo-100 text-indigo-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    
    const statusTranslation = {
      pending: "Pending",
      assigned: "Assigned",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled"
    };
    
    return <span className={`${badgeClasses.base} ${badgeClasses[status]}`}>
        {statusTranslation[status] || status}
      </span>;
  };

  if (loading) {
    return <div className="flex h-screen bg-gray-50">
        <CustomerSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
        </div>
      </div>;
  }

  return <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Customer Dashboard</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
              <Button onClick={handleCreateOrder} className="bg-safedrop-gold hover:bg-safedrop-gold/90 gap-2">
                <PlusCircle size={16} />
                New Order
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-safedrop-gold" />
                    <span>Total Orders</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-safedrop-gold" />
                    <span>In Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.inProgress}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-safedrop-gold" />
                    <span>Completed</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>;
};

const CustomerDashboard = () => {
  return <LanguageProvider>
      <CustomerDashboardContent />
    </LanguageProvider>;
};

export default CustomerDashboard;
