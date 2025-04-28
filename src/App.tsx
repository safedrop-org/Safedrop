
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/AuthContext';
import { LanguageProvider } from '@/components/ui/language-context';

// Public Pages
import Home from './pages/Index';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/auth/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Services from './pages/Services';
import Terms from './pages/Terms';
import CustomerRegister from './pages/auth/CustomerRegister';
import DriverRegister from './pages/auth/DriverRegister';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOrders from './pages/customer/CustomerOrders';
import CreateOrder from './pages/customer/CreateOrder';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerBilling from './pages/customer/CustomerBilling';
import CustomerSupport from './pages/customer/CustomerSupport';
import CustomerFeedback from './pages/customer/CustomerFeedback';
import Logout from './pages/customer/Logout';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomersWithSidebar from './pages/admin/CustomersWithSidebar';
import DriverVerificationWithSidebar from './pages/admin/DriverVerificationWithSidebar';
import DriverDetailsWithSidebar from './pages/admin/DriverDetailsWithSidebar';
import FinanceWithSidebar from './pages/admin/FinanceWithSidebar';
import OrdersWithSidebar from './pages/admin/OrdersWithSidebar';
import ComplaintsWithSidebar from './pages/admin/ComplaintsWithSidebar';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverOrders from './pages/driver/DriverOrders';
import PendingApproval from './pages/driver/PendingApproval';
import DriverRatings from './pages/driver/DriverRatings';
import DriverProfile from './pages/driver/DriverProfile';
import DriverEarnings from './pages/driver/DriverEarnings';
import DriverNotifications from './pages/driver/DriverNotifications';
import DriverSupport from './pages/driver/DriverSupport';
import DriverSettings from './pages/driver/DriverSettings';

// Auth Components
import { useAuth } from '@/components/auth/AuthContext';
import ProtectedAdminRoute from '@/components/admin/ProtectedAdminRoute';
import { supabase } from '@/integrations/supabase/client';

// Protected Routes for Customer
const ProtectedCustomerRoute = ({ children }) => {
  const { isLoggedIn, userType, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }
  
  if (!isLoggedIn) {
    console.log("Not logged in, redirecting to login");
    return <Navigate to="/login" />;
  }
  
  console.log("User type in protected customer route:", userType);
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

// Protected Routes for Driver
const ProtectedDriverRoute = ({ children }) => {
  const { isLoggedIn, userType, user, loading } = useAuth();
  const [driverStatus, setDriverStatus] = React.useState(null);
  const [statusLoading, setStatusLoading] = React.useState(true);
  
  React.useEffect(() => {
    const checkDriverStatus = async () => {
      if (isLoggedIn && user) {
        try {
          // First check if the user has a driver role
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'driver')
            .maybeSingle();
            
          const isDriver = !roleError && roleData;
          
          // If user has driver role or user_type is driver, check driver status
          if (isDriver || userType === 'driver') {
            const { data, error } = await supabase
              .from('drivers')
              .select('status')
              .eq('id', user.id)
              .maybeSingle();
            
            if (!error && data) {
              console.log("Driver status found:", data.status);
              setDriverStatus(data.status);
            } else {
              console.error("Error or no data for driver status:", error);
            }
          } else {
            console.log("User is not a driver");
          }
        } catch (err) {
          console.error("Exception checking driver status:", err);
        }
      }
      setStatusLoading(false);
    };
    
    checkDriverStatus();
  }, [isLoggedIn, userType, user]);
  
  if (loading || statusLoading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }
  
  if (!isLoggedIn) {
    console.log("Not logged in, redirecting to login");
    return <Navigate to="/login" />;
  }
  
  // If userType is not 'driver', but user has driver records, treat them as a driver
  const hasDriverData = driverStatus !== null;
  const effectiveUserType = hasDriverData ? 'driver' : userType;
  
  console.log("User type in protected driver route:", effectiveUserType, "Driver status:", driverStatus);
  if (effectiveUserType !== 'driver' && !hasDriverData) {
    if (userType === 'customer') {
      return <Navigate to="/customer/dashboard" />;
    } else if (userType === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else {
      return <Navigate to="/login" />;
    }
  }
  
  // Check driver status to see if they should be directed to pending approval
  if (driverStatus === 'pending' || driverStatus === 'rejected') {
    const currentPath = window.location.pathname;
    if (currentPath !== '/driver/pending-approval') {
      console.log("Driver pending/rejected, redirecting to pending approval page");
      return <Navigate to="/driver/pending-approval" />;
    }
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  const { user } = useAuth();
  
  React.useEffect(() => {
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
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
        
        {/* Registration Routes */}
        <Route path="/register/customer" element={<CustomerRegister />} />
        <Route path="/register/driver" element={<DriverRegister />} />

        {/* Admin Login Route */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Customer Routes - Updated with all the required pages */}
        <Route 
          path="/customer" 
          element={
            <ProtectedCustomerRoute>
              <Outlet />
            </ProtectedCustomerRoute>
          }
        >
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="create-order" element={<CreateOrder />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="billing" element={<CustomerBilling />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="support" element={<CustomerSupport />} />
          <Route path="feedback" element={<CustomerFeedback />} />
          <Route path="logout" element={<Logout />} />
        </Route>

        {/* Admin Routes - Using ProtectedAdminRoute component */}
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

        {/* Driver Routes */}
        <Route path="/driver/pending-approval" element={<PendingApproval />} />
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
          <Route path="profile" element={<DriverProfile />} />
          <Route path="ratings" element={<DriverRatings />} />
          <Route path="earnings" element={<DriverEarnings />} />
          <Route path="notifications" element={<DriverNotifications />} />
          <Route path="support" element={<DriverSupport />} />
          <Route path="settings" element={<DriverSettings />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <AppContent />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
