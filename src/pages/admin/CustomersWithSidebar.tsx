
import React from "react";
import Customers from "./Customers";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LanguageProvider } from "@/components/ui/language-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const CustomersWithSidebar = () => {
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
              <Customers />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
};

export default CustomersWithSidebar;
