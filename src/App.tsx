
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext'; // Fixed import path with @ alias
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from 'sonner'; // Replace ToastContainer with Toaster

// Public Pages
import Home from './pages/Index'; // Use existing Index.tsx as Home
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/auth/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Pricing from './pages/Services'; // Use existing Services.tsx as Pricing

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Logout from './pages/customer/Logout';
import Profile from './pages/customer/CustomerProfile'; // Use existing CustomerProfile.tsx as Profile

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomersWithSidebar from './pages/admin/CustomersWithSidebar';
import DriverVerificationWithSidebar from './pages/admin/DriverVerificationWithSidebar';
import DriverDetailsWithSidebar from './pages/admin/DriverDetailsWithSidebar';
import FinanceWithSidebar from './pages/admin/FinanceWithSidebar';
import OrdersWithSidebar from './pages/admin/OrdersWithSidebar';
import ComplaintsWithSidebar from './pages/admin/ComplaintsWithSidebar';
import SettingsWithSidebar from './pages/admin/SettingsWithSidebar';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';

// Protected Routes
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
};

const ProtectedCustomerRoute = ({ children }) => {
  const { isLoggedIn, userType } = useAuth();
  return isLoggedIn && userType === 'customer' ? <>{children}</> : <Navigate to="/login" />;
};

const ProtectedAdminRoute = ({ children }) => {
  const { isLoggedIn, userType } = useAuth();
  return isLoggedIn && userType === 'admin' ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="*" element={<NotFound />} />

          {/* Admin Login Route */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Customer Routes */}
          <Route 
            path="/customer" 
            element={
              <ProtectedCustomerRoute>
                <Outlet />
              </ProtectedCustomerRoute>
            }
          >
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="logout" element={<Logout />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/customers" element={<CustomersWithSidebar />} />
          <Route path="/admin/driver-verification" element={<DriverVerificationWithSidebar />} />
          <Route path="/admin/driver-details/:id" element={<DriverDetailsWithSidebar />} />
          <Route path="/admin/finance" element={<FinanceWithSidebar />} />
          <Route path="/admin/orders" element={<OrdersWithSidebar />} />
          <Route path="/admin/complaints" element={<ComplaintsWithSidebar />} />
          <Route path="/admin/settings" element={<SettingsWithSidebar />} />

          {/* Driver Routes */}
          <Route 
            path="/driver" 
            element={
              <ProtectedRoute>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DriverDashboard />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="bottom-right" />
    </>
  );
};

export default App;
