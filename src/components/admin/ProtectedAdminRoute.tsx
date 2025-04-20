
import React, { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminAuth = () => {
      // Read adminAuth flag from localStorage
      const isAdminLoggedIn = localStorage.getItem('adminAuth') === 'true';

      if (isAdminLoggedIn) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        navigate("/admin");
      }
    };

    checkAdminAuth();
  }, [navigate]);

  // Render children only if authorized
  if (isAuthorized === null) {
    // Optionally render a loading placeholder while checking auth
    return null;
  } else if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
