import React from "react";
import AdminSidebar from "./AdminSidebar";
import { LanguageProvider, useLanguage } from "@/components/ui/language-context";

interface AdminLayoutWithHeaderProps {
  children: React.ReactNode;
  title: string;
  headerActions?: React.ReactNode;
  className?: string;
  mainClassName?: string;
}

/**
 * AdminLayoutWithHeaderContent - محتوى التخطيط مع Header
 */
const AdminLayoutWithHeaderContent: React.FC<Omit<AdminLayoutWithHeaderProps, 'title'> & { title: string }> = ({ 
  children, 
  title, 
  headerActions, 
  className = "bg-gray-50", 
  mainClassName = "p-4" 
}) => {
  const { t } = useLanguage();
  
  return (
    <div className={`flex h-screen ${className}`}>
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {title}
            </h1>
            {headerActions && (
              <div className="flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>
        </header>

        <main className={`flex-1 overflow-auto ${mainClassName}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

/**
 * AdminLayoutWithHeader - مكون تخطيط مشترك مع Header لصفحات الإدارة
 * يوفر البنية الأساسية مع الشريط الجانبي، header، ومنطقة المحتوى الرئيسي
 */
const AdminLayoutWithHeader: React.FC<AdminLayoutWithHeaderProps> = (props) => {
  return (
    <LanguageProvider>
      <AdminLayoutWithHeaderContent {...props} />
    </LanguageProvider>
  );
};

export default AdminLayoutWithHeader;
