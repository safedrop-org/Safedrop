import React from "react";
import Complaints from "./Complaints";
import { AdminLayout } from "@/components/admin";

const ComplaintsWithSidebar = () => {
  return (
    <AdminLayout>
      <Complaints />
    </AdminLayout>
  );
};

export default ComplaintsWithSidebar;
