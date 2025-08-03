import React from "react";
import Customers from "./Customers";
import { AdminLayout } from "@/components/admin";

const CustomersWithSidebar = () => {
  return (
    <AdminLayout>
      <Customers />
    </AdminLayout>
  );
};

export default CustomersWithSidebar;
