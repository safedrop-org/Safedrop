
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Import new pages
import Login from "./pages/auth/Login";
import CustomerRegister from "./pages/auth/CustomerRegister";
import DriverRegister from "./pages/auth/DriverRegister";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register/customer" element={<CustomerRegister />} />
          <Route path="/register/driver" element={<DriverRegister />} />
          
          {/* Dashboard Routes - To be implemented */}
          {/* <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
