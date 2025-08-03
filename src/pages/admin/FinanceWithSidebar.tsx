import React from "react";
import Finance from "./Finance";
import { AdminLayout } from "@/components/admin";

const FinanceWithSidebar = () => {
  return (
    <AdminLayout>
      <Finance />
    </AdminLayout>
  );
};

export default FinanceWithSidebar;
