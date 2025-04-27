
import React from "react";
import DriverVerification from "./DriverVerification";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LanguageProvider } from "@/components/ui/language-context";

const DriverVerificationWithSidebar = () => {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-grow p-6">
          <DriverVerification />
        </main>
      </div>
    </LanguageProvider>
  );
};

export default DriverVerificationWithSidebar;
