
import React from "react";
import Finance from "./Finance";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LanguageProvider } from "@/components/ui/language-context";

const FinanceWithSidebar = () => {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-grow p-6">
          <Finance />
        </main>
      </div>
    </LanguageProvider>
  );
};

export default FinanceWithSidebar;
