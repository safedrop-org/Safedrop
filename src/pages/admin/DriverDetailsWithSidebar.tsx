
import React from "react";
import DriverDetails from "./DriverDetails";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LanguageProvider } from "@/components/ui/language-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const DriverDetailsWithSidebar = () => {
  return (
    <LanguageProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <main className="flex-grow">
            <div className="p-4">
              <SidebarTrigger />
            </div>
            <div className="p-6">
              <DriverDetails />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
};

export default DriverDetailsWithSidebar;
