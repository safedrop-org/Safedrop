import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './components/auth/AuthContext';
import { supabase } from './integrations/supabase/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Pricing from './pages/Pricing';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Logout from './pages/customer/Logout';
import Profile from './pages/customer/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomersWithSidebar from './pages/admin/CustomersWithSidebar';
import DriverVerificationWithSidebar from './pages/admin/DriverVerificationWithSidebar';
import DriverDetailsWithSidebar from './pages/admin/DriverDetailsWithSidebar';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';

// Protected Routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
};

const ProtectedCustomerRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, userType } = useAuth();
  return isLoggedIn && userType === 'customer' ? <>{children}</> : <Navigate to="/login" />;
};

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, userType } = useAuth();
  return isLoggedIn && userType === 'admin' ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
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

          {/* Customer Routes */}
          <Route path="/customer" element={<ProtectedCustomerRoute />}>
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="logout" element={<Logout />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedAdminRoute />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="customers" element={<CustomersWithSidebar />} />
            <Route path="driver-verification" element={<DriverVerificationWithSidebar />} />
            <Route path="driver-details/:id" element={<DriverDetailsWithSidebar />} />
          </Route>

          {/* Driver Routes */}
          <Route path="/driver" element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DriverDashboard />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  );
};

export default App;
