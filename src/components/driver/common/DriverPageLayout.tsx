import React from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import DriverSidebar from '@/components/driver/DriverSidebar';

interface DriverPageLayoutProps {
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

const DriverPageLayoutContent: React.FC<DriverPageLayoutProps> = ({
  title,
  children,
  headerActions,
  className = ''
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />
      
      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {headerActions && (
                <div className="flex items-center gap-2">
                  {headerActions}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-auto p-4 ${className}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverPageLayout: React.FC<DriverPageLayoutProps> = (props) => {
  return (
    <LanguageProvider>
      <DriverPageLayoutContent {...props} />
    </LanguageProvider>
  );
};

export default DriverPageLayout;
