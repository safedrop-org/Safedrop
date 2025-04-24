
import React from "react";
import Finance from "./Finance";
import AdminSidebar from "@/components/admin/AdminSidebar";

const FinanceWithSidebar = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-grow p-6">
        <Finance />
      </main>
    </div>
  );
};

export default FinanceWithSidebar;
