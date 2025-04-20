
import React, { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .single();

      if (error || !profile || profile.user_type !== "admin") {
        toast.error("ليس لديك صلاحية الدخول إلى هذه الصفحة.");
        if (profile?.user_type === "customer") {
          navigate("/customer/dashboard");
        } else if (profile?.user_type === "driver") {
          navigate("/driver/dashboard");
        } else {
          navigate("/login");
        }
      }
    };

    checkAdmin();
  }, [navigate]);

  return <>{children}</>;
};

export default ProtectedAdminRoute;
