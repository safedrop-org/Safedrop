
import React from "react";
import Complaints from "./Complaints";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LanguageProvider } from "@/components/ui/language-context";

const ComplaintsWithSidebar = () => {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-grow p-6">
          <Complaints />
        </main>
      </div>
    </LanguageProvider>
  );
};

export default ComplaintsWithSidebar;
