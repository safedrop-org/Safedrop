
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/components/ui/language-context";
import { useEffect, useState } from "react";
import { setupDatabase } from "@/integrations/supabase/db-init";
import { createProfilesTableSql, createDriversTableSql } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2Icon, RefreshCcwIcon, DatabaseIcon } from "lucide-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Public Pages
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Auth Pages
import Login from "./pages/auth/Login";
import CustomerRegister from "./pages/auth/CustomerRegister";
import DriverRegister from "./pages/auth/DriverRegister";
import EmailVerification from "./pages/auth/EmailVerification";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DriverVerification from "./pages/admin/DriverVerification";
import Finance from "./pages/admin/Finance";
import Customers from "./pages/admin/Customers";
import Orders from "./pages/admin/Orders";
import Complaints from "./pages/admin/Complaints";
import Settings from "./pages/admin/Settings";

// Customer Pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerProfile from "./pages/customer/CustomerProfile";

// Driver Pages
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverProfile from "./pages/driver/DriverProfile";
import DriverOrders from "./pages/driver/DriverOrders";
import DriverVehicle from "./pages/driver/DriverVehicle";
import PendingApproval from "./pages/driver/PendingApproval";

const queryClient = new QueryClient();

// Database initialization component
const DatabaseInitializer = ({ onSuccess }: { onSuccess: () => void }) => {
  const [initializing, setInitializing] = useState(true);
  const [manualSetupRequired, setManualSetupRequired] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const initDb = async () => {
    setInitializing(true);
    try {
      const result = await setupDatabase();
      
      if (result.success) {
        if (result.tablesCreated) {
          toast.success("تم إنشاء جداول قاعدة البيانات بنجاح");
        }
        onSuccess();
      } else {
        console.error("Database initialization failed:", result.error);
        toast.error("يلزم إنشاء جداول قاعدة البيانات يدوياً");
        setManualSetupRequired(true);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error during database initialization:", error);
      toast.error("خطأ في تهيئة قاعدة البيانات");
      setManualSetupRequired(true);
      setDialogOpen(true);
    } finally {
      setInitializing(false);
    }
  };
  
  useEffect(() => {
    initDb();
  }, []);
  
  if (initializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2Icon className="h-16 w-16 text-safedrop-primary animate-spin mx-auto" />
          <p className="mt-4 text-lg">جاري تهيئة التطبيق...</p>
        </div>
      </div>
    );
  }
  
  if (manualSetupRequired) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                تنبيه: يلزم إعداد قاعدة البيانات يدوياً
              </DialogTitle>
              <DialogDescription className="text-base">
                لم نتمكن من إنشاء جداول قاعدة البيانات تلقائياً. يرجى إنشاء الجداول التالية في لوحة تحكم Supabase:
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
              <div className="flex items-center mb-2">
                <DatabaseIcon className="h-5 w-5 text-yellow-700 mr-2" />
                <p className="font-semibold">قم بإنشاء الجداول التالية في لوحة تحكم Supabase</p>
              </div>
              
              <div className="mt-4 bg-white p-3 rounded border border-gray-200 overflow-auto text-left">
                <p className="font-semibold">1. جدول profiles:</p>
                <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                  {createProfilesTableSql}
                </pre>
                
                <p className="font-semibold mt-4">2. جدول drivers:</p>
                <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                  {createDriversTableSql}
                </pre>
              </div>
              
              <p className="mt-4 text-center">بعد إنشاء الجداول، قم بتحديث الصفحة.</p>
            </div>
            
            <div className="flex justify-center mt-4">
              <Button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-safedrop-primary text-white rounded-md hover:bg-safedrop-primary/90 transition-colors text-lg font-semibold"
              >
                <RefreshCcwIcon className="h-5 w-5 mr-2" />
                تحديث الصفحة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <div className="max-w-lg mx-auto p-4 text-center">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
            <img 
              src="/lovable-uploads/1886cc0f-1edf-43cd-ac23-b828270d4ea4.png" 
              alt="Database Setup Required" 
              className="mx-auto mb-4 max-w-full" 
            />
            <p className="font-bold text-xl">تنبيه: يلزم إعداد قاعدة البيانات يدوياً</p>
            <p className="mt-2">لم نتمكن من إنشاء جداول قاعدة البيانات تلقائياً. انقر على الزر أدناه لمعرفة التفاصيل.</p>
          </div>
          <Button 
            onClick={() => setDialogOpen(true)}
            className="px-6 py-3 bg-safedrop-primary text-white rounded-md hover:bg-safedrop-primary/90 transition-colors text-lg font-semibold"
          >
            <DatabaseIcon className="h-5 w-5 mr-2" />
            عرض التفاصيل
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-safedrop-gold text-white rounded-md hover:bg-safedrop-gold/90 transition-colors text-lg font-semibold ml-2"
          >
            <RefreshCcwIcon className="h-5 w-5 mr-2" />
            تحديث الصفحة
          </Button>
        </div>
      </div>
    );
  }
  
  return null;
};

const AppContent = () => {
  const [dbInitialized, setDbInitialized] = useState(false);
  
  if (!dbInitialized) {
    return <DatabaseInitializer onSuccess={() => setDbInitialized(true)} />;
  }

  // Continue with routing after DB initialization
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        
        {/* Public Pages */}
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register/customer" element={<CustomerRegister />} />
        <Route path="/register/driver" element={<DriverRegister />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/drivers" element={<DriverVerification />} />
        <Route path="/admin/finance" element={<Finance />} />
        <Route path="/admin/customers" element={<Customers />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/complaints" element={<Complaints />} />
        <Route path="/admin/settings" element={<Settings />} />
        
        {/* Customer Routes */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        
        {/* Driver Routes */}
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/driver/profile" element={<DriverProfile />} />
        <Route path="/driver/orders" element={<DriverOrders />} />
        <Route path="/driver/vehicle" element={<DriverVehicle />} />
        <Route path="/driver/pending-approval" element={<PendingApproval />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
