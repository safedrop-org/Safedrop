
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/components/ui/language-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  created_at: string;
}

const Customers = () => {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check session and role to protect route access
  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }
      // Fetch profile user_type
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.user_type !== "admin") {
        // Not admin, redirect to relevant dashboard or login
        if (profile?.user_type === "customer") {
          navigate("/customer/dashboard");
        } else if (profile?.user_type === "driver") {
          navigate("/driver/dashboard");
        } else {
          navigate("/login");
        }
      }
    };

    checkAccess();
  }, [navigate]);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, phone, user_type, email, created_at")
      .eq("user_type", "customer");

    if (error) {
      toast.error(t("fetchCustomersError"));
      console.error("Error fetching customers:", error);
    } else if (data) {
      // Data from supabase may have any type, so ensure it fits Customer interface
      const customersFormatted = data.map((cust: any) => ({
        id: cust.id,
        first_name: cust.first_name,
        last_name: cust.last_name,
        phone: cust.phone,
        email: cust.email,
        created_at: cust.created_at,
      })) as Customer[];
      setCustomers(customersFormatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="p-6 flex flex-col min-h-svh">
      <h1 className="text-2xl font-bold mb-6">إدارة العملاء</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم الأول</TableHead>
            <TableHead>اسم العائلة</TableHead>
            <TableHead>الهاتف</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>تاريخ الإنضمام</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.first_name}</TableCell>
              <TableCell>{customer.last_name}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.email ?? "-"}</TableCell>
              <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
          {customers.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                لا يوجد عملاء للعرض
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Customers;
