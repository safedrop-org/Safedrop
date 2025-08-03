import React from "react";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { LanguageProvider, useLanguage } from "@/components/ui/language-context";

interface CustomerPageLayoutProps {
  children: React.ReactNode;
  title: string;
  headerActions?: React.ReactNode;
  loading?: boolean;
}

const CustomerPageLayoutContent: React.FC<Omit<CustomerPageLayoutProps, 'loading'>> = ({
  children,
  title,
  headerActions,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {headerActions && (
                <div className="flex gap-2">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

const CustomerPageLayout: React.FC<CustomerPageLayoutProps> = ({
  loading = false,
  ...props
}) => {
  if (loading) {
    return (
      <LanguageProvider>
        <div className="flex h-screen bg-gray-50">
          <CustomerSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <CustomerPageLayoutContent {...props} />
    </LanguageProvider>
  );
};

export default CustomerPageLayout;
