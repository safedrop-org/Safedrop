import React from "react";
import AdminSidebar from "./AdminSidebar";
import { LanguageProvider } from "@/components/ui/language-context";

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * AdminLayout - مكون تخطيط مشترك لجميع صفحات الإدارة
 * يوفر البنية الأساسية مع الشريط الجانبي ومنطقة المحتوى الرئيسي
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children, className = "" }) => {
  return (
    <LanguageProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className={`flex-1 overflow-y-auto p-6 ${className}`}>
            {children}
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
};

export default AdminLayout;
