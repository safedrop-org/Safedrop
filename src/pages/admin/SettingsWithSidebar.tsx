
import React from "react";
import Settings from "./Settings";
import AdminSidebar from "@/components/admin/AdminSidebar";

const SettingsWithSidebar = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-grow p-6">
        <Settings />
      </main>
    </div>
  );
};

export default SettingsWithSidebar;
