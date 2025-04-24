
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './components/auth/AuthContext';
import { supabase } from './integrations/supabase/client';
import { ToastContainer } from 'sonner';
import 'react-toastify/dist/ReactToastify.css';

// Public Pages
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomersWithSidebar from './pages/admin/CustomersWithSidebar';
import DriverVerificationWithSidebar from './pages/admin/DriverVerificationWithSidebar';
import DriverDetailsWithSidebar from './pages/admin/DriverDetailsWithSidebar';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';

const Home = () => <div>Home Page</div>;
const Login = () => <div>Login Page</div>;
const Register = () => <div>Register Page</div>;
const Pricing = () => <div>Pricing Page</div>;
const CustomerDashboard = () => <div>Customer Dashboard</div>;
const Profile = () => <div>Profile Page</div>;
const Logout = () => <div>Logout Page</div>;

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

          {/* Customer Routes */}
          <Route 
            path="/customer" 
            element={<ProtectedCustomerRoute><Outlet /></ProtectedCustomerRoute>}
          >
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="logout" element={<Logout />} />
          </Route>

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={<ProtectedAdminRoute><Outlet /></ProtectedAdminRoute>}
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="customers" element={<CustomersWithSidebar />} />
            <Route path="driver-verification" element={<DriverVerificationWithSidebar />} />
            <Route path="driver-details/:id" element={<DriverDetailsWithSidebar />} />
          </Route>

          {/* Driver Routes */}
          <Route 
            path="/driver" 
            element={<ProtectedRoute><Outlet /></ProtectedRoute>}
          >
            <Route path="dashboard" element={<DriverDashboard />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default App;
