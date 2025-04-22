
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem('customerAuth');
    // Redirect to login after clearing
    navigate('/login');
  }, [navigate]);

  return null;
};

export default Logout;
