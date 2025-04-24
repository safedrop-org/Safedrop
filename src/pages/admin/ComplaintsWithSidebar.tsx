
import React from "react";
import Complaints from "./Complaints";
import AdminSidebar from "@/components/admin/AdminSidebar";

const ComplaintsWithSidebar = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-grow p-6">
        <Complaints />
      </main>
    </div>
  );
};

export default ComplaintsWithSidebar;
