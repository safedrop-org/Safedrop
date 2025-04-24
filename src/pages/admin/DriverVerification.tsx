
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/components/ui/language-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: string | null;
  rejection_reason?: string | null;
  user_type: string;
}

const DriverVerification = () => {
  const { t } = useLanguage();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDrivers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, phone, user_type")
      .eq("user_type", "driver");

    if (error) {
      toast.error(t("fetchDriversError"));
      console.error("Error fetching drivers:", error);
    } else if (data) {
      const driverIds = data.map(d => d.id);
      const { data: driversData, error: driversError } = await supabase
        .from("drivers")
        .select("id, status, rejection_reason")
        .in("id", driverIds);

      if (driversError) {
        toast.error(t("fetchDriversError"));
        console.error("Error fetching drivers details:", driversError);
        setLoading(false);
        return;
      }

      const driversCombined = data.map((profile) => {
        const driverDetail = driversData?.find(d => d.id === profile.id);
        return {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          user_type: profile.user_type,
          status: driverDetail?.status ?? null,
          rejection_reason: driverDetail?.rejection_reason ?? null,
        };
      });

      setDrivers(driversCombined);
    }
    setLoading(false);
  };

  const updateDriverStatus = async (id: string, status: string, rejectionReason?: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("drivers")
      .update({ status, rejection_reason: rejectionReason })
      .eq("id", id);

    if (error) {
      toast.error(t("updateDriverStatusError"));
      console.error("Error updating driver status:", error);
    } else {
      toast.success(t("updateDriverStatusSuccess"));
      await fetchDrivers();
    }
    setLoading(false);
  };

  const navigateToDriverDetails = (driverId: string) => {
    navigate(`/admin/driver-details/${driverId}`);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <div className="p-6 flex flex-col min-h-svh">
      <h1 className="text-2xl font-bold mb-6">إدارة السائقين</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم الأول</TableHead>
            <TableHead>اسم العائلة</TableHead>
            <TableHead>الهاتف</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>سبب الرفض</TableHead>
            <TableHead className="text-center">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell>{driver.first_name}</TableCell>
              <TableCell>{driver.last_name}</TableCell>
              <TableCell>{driver.phone}</TableCell>
              <TableCell>
                {driver.status === "approved" ? (
                  <span className="text-green-600">مقبول</span>
                ) : driver.status === "pending" ? (
                  <span className="text-yellow-600">قيد المراجعة</span>
                ) : driver.status === "rejected" ? (
                  <span className="text-red-600">مرفوض</span>
                ) : (
                  <span className="text-gray-600">غير محدد</span>
                )}
              </TableCell>
              <TableCell>{driver.rejection_reason ?? "-"}</TableCell>
              <TableCell className="flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateToDriverDetails(driver.id)}
                >
                  <Eye size={16} className="ml-1" /> عرض التفاصيل
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {drivers.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                لا يوجد سائقين للعرض
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DriverVerification;
