
import React from "react";
import Customers from "./Customers";
import AdminSidebar from "@/components/admin/AdminSidebar";

const CustomersWithSidebar = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-grow p-6">
        <Customers />
      </main>
    </div>
  );
};

export default CustomersWithSidebar;
