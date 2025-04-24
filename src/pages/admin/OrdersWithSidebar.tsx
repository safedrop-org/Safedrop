
import React from "react";
import Orders from "./Orders";
import AdminSidebar from "@/components/admin/AdminSidebar";

const OrdersWithSidebar = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-grow p-6">
        <Orders />
      </main>
    </div>
  );
};

export default OrdersWithSidebar;
