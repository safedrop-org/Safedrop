
import React from "react";
import Customers from "./Customers";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LanguageProvider } from "@/components/ui/language-context";

const CustomersWithSidebar = () => {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-grow p-6">
          <Customers />
        </main>
      </div>
    </LanguageProvider>
  );
};

export default CustomersWithSidebar;
