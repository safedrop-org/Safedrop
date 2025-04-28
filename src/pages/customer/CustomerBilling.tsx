
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { CreditCard, DollarSign, Receipt, AlertCircle } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';

const CustomerBillingContent = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, price, payment_status, created_at, status')
          .eq('customer_id', user.id);
        
        if (ordersError) throw ordersError;

        // Calculate total spent on completed orders
        const total = orders
          .filter(order => order.status === 'completed' && order.payment_status === 'paid')
          .reduce((sum, order) => sum + (order.price || 0), 0);
        
        setTotalSpent(total);
        setTransactions(orders || []);
      } catch (error) {
        console.error('Error fetching billing data:', error);
        toast.error('Error loading billing data');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
    }).format(date);
  };
  
  const formatCurrency = (amount) => {
    return amount ? `${amount.toFixed(2)} SAR` : '0.00 SAR';
  };

  const getPaymentStatusBadge = (status) => {
    const badgeClasses = {
      base: "px-2 py-1 rounded-full text-xs font-medium",
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800"
    };
    
    const statusTranslation = {
      paid: "Paid",
      pending: "Pending",
      failed: "Failed"
    };

    return (
      <span className={`${badgeClasses.base} ${badgeClasses[status]}`}>
        {statusTranslation[status] || status}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">Billing & Payment</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-safedrop-gold" />
                    <span>Total Payments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-safedrop-gold" />
                    <span>Payment Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">You need to add a payment method</p>
                  <p className="text-sm text-gray-500">No payment methods registered</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-safedrop-gold" />
                    <span>Number of Invoices</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{transactions.length}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((tx) => (
                          <tr key={tx.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {tx.id.slice(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(tx.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(tx.price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getPaymentStatusBadge(tx.payment_status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                    <p>No financial transactions currently</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

const CustomerBilling = () => {
  return (
    <LanguageProvider>
      <CustomerBillingContent />
    </LanguageProvider>
  );
};

export default CustomerBilling;
