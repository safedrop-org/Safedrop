
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from 'sonner';

// Public Pages
import Home from './pages/Index';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/auth/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Services from './pages/Services';
import CustomerRegister from './pages/auth/CustomerRegister';
import DriverRegister from './pages/auth/DriverRegister';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Logout from './pages/customer/Logout';
import Profile from './pages/customer/CustomerProfile';

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
import DriverOrders from './pages/driver/DriverOrders';
import PendingApproval from './pages/driver/PendingApproval';

// Protected Routes
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const ProtectedCustomerRoute = ({ children }) => {
  const { isLoggedIn, userType } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  if (userType !== 'customer') {
    if (userType === 'driver') {
      return <Navigate to="/driver/dashboard" />;
    } else if (userType === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/login" />;
    }
  }
  
  return <>{children}</>;
};

const ProtectedDriverRoute = ({ children }) => {
  const { isLoggedIn, userType, user } = useAuth();
  const [driverStatus, setDriverStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const checkDriverStatus = async () => {
      if (isLoggedIn && userType === 'driver' && user) {
        try {
          const { data, error } = await supabase
            .from('drivers')
            .select('status')
            .eq('id', user.id)
            .maybeSingle();
          
          if (!error && data) {
            setDriverStatus(data.status);
          }
        } catch (err) {
          console.error("Error checking driver status:", err);
        }
      }
      setLoading(false);
    };
    
    checkDriverStatus();
  }, [isLoggedIn, userType, user]);
  
  if (loading) {
    return null; // or a loading spinner
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  if (userType !== 'driver') {
    if (userType === 'customer') {
      return <Navigate to="/customer/dashboard" />;
    } else if (userType === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/login" />;
    }
  }
  
  return <>{children}</>;
};

const ProtectedAdminRoute = ({ children }) => {
  const { isLoggedIn, userType } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/admin" />;
  }
  
  if (userType !== 'admin') {
    if (userType === 'customer') {
      return <Navigate to="/customer/dashboard" />;
    } else if (userType === 'driver') {
      return <Navigate to="/driver/dashboard" />;
    } else {
      return <Navigate to="/admin" />;
    }
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    // Log auth state for debugging
    console.log("Auth state in App:", { user });
  }, [user]);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/services" element={<Services />} />
        <Route path="*" element={<NotFound />} />
        
        {/* Registration Routes */}
        <Route path="/register/customer" element={<CustomerRegister />} />
        <Route path="/register/driver" element={<DriverRegister />} />

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
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/customers" 
          element={
            <ProtectedAdminRoute>
              <CustomersWithSidebar />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/driver-verification" 
          element={
            <ProtectedAdminRoute>
              <DriverVerificationWithSidebar />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/driver-details/:id" 
          element={
            <ProtectedAdminRoute>
              <DriverDetailsWithSidebar />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/finance" 
          element={
            <ProtectedAdminRoute>
              <FinanceWithSidebar />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/orders" 
          element={
            <ProtectedAdminRoute>
              <OrdersWithSidebar />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/complaints" 
          element={
            <ProtectedAdminRoute>
              <ComplaintsWithSidebar />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedAdminRoute>
              <SettingsWithSidebar />
            </ProtectedAdminRoute>
          } 
        />

        {/* Driver Routes */}
        <Route 
          path="/driver" 
          element={
            <ProtectedDriverRoute>
              <Outlet />
            </ProtectedDriverRoute>
          }
        >
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="orders" element={<DriverOrders />} />
          <Route path="pending-approval" element={<PendingApproval />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
