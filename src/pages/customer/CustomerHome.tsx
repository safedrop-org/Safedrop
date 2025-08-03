
import React from 'react';
import CustomerPageLayout from '@/components/customer/CustomerPageLayout';
import { useLanguage } from '@/components/ui/language-context';

const CustomerHome: React.FC = () => {
  const { t } = useLanguage();

  return (
    <CustomerPageLayout title={t('Dashboard')}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('welcomeCustomerDashboard')}
          </h2>
          <p className="text-gray-600">
            {t('dashboardDescription') || 'Manage your deliveries and track your orders from this dashboard.'}
          </p>
        </div>
      </div>
    </CustomerPageLayout>
  );
};

export default CustomerHome;
