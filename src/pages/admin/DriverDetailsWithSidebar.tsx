
import React from "react";
import DriverDetails from "./DriverDetails";
import AdminSidebar from "@/components/admin/AdminSidebar";

const DriverDetailsWithSidebar = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-grow p-6">
        <DriverDetails />
      </main>
    </div>
  );
};

export default DriverDetailsWithSidebar;
