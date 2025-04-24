
import React from "react";
import Orders from "./Orders";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LanguageProvider } from "@/components/ui/language-context";

const OrdersWithSidebar = () => {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-grow p-6">
          <Orders />
        </main>
      </div>
    </LanguageProvider>
  );
};

export default OrdersWithSidebar;
