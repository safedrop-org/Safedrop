
import React from "react";
import DriverVerification from "./DriverVerification";
import AdminSidebar from "@/components/admin/AdminSidebar";

const DriverVerificationWithSidebar = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-grow p-6">
        <DriverVerification />
      </main>
    </div>
  );
};

export default DriverVerificationWithSidebar;
