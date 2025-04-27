
import React from "react";
import DriverVerification from "./DriverVerification";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LanguageProvider } from "@/components/ui/language-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const DriverVerificationWithSidebar = () => {
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
              <DriverVerification />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
};

export default DriverVerificationWithSidebar;
