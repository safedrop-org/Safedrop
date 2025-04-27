
import React from "react";
import DriverDetails from "./DriverDetails";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LanguageProvider } from "@/components/ui/language-context";

const DriverDetailsWithSidebar = () => {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-grow p-6">
          <DriverDetails />
        </main>
      </div>
    </LanguageProvider>
  );
};

export default DriverDetailsWithSidebar;
