import React from "react";
import Orders from "./Orders";
import { AdminLayout } from "@/components/admin";

const OrdersWithSidebar = () => {
  return (
    <AdminLayout>
      <Orders />
    </AdminLayout>
  );
};

export default OrdersWithSidebar;
