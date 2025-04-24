
import React from "react";
import Settings from "./Settings";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LanguageProvider } from "@/components/ui/language-context";

const SettingsWithSidebar = () => {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-grow p-6">
          <Settings />
        </main>
      </div>
    </LanguageProvider>
  );
};

export default SettingsWithSidebar;
