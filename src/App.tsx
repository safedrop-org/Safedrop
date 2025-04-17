
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/components/ui/language-context";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
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
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
