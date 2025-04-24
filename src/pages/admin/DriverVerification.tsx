
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/components/ui/language-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye, Search, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: string | null;
  email?: string | null;
  user_type: string;
}

const DriverVerification = () => {
  const { t } = useLanguage();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [currentTab, setCurrentTab] = useState("pending");
  const navigate = useNavigate();

  const fetchDrivers = async () => {
    console.log("Fetching drivers...");
    setLoading(true);
    try {
      // First, fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, phone, user_type")
        .eq("user_type", "driver");

      if (profilesError) throw profilesError;

      if (!profilesData) {
        setDrivers([]);
        return;
      }

      const driverIds = profilesData.map(d => d.id);
      
      // Fetch driver details
      const { data: driversData, error: driversError } = await supabase
        .from("drivers")
        .select("id, status")
        .in("id", driverIds);

      if (driversError) throw driversError;

      // Create a map for quick lookup of driver status
      const driverStatusMap = {};
      if (driversData) {
        driversData.forEach(driver => {
          driverStatusMap[driver.id] = driver.status;
        });
      }

      // Fetch emails from auth (this will work if you have admin rights)
      const emailPromises = driverIds.map(async (id) => {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(id);
          return { id, email: userData?.user?.email };
        } catch (err) {
          console.error(`Error fetching email for user ${id}:`, err);
          return { id, email: null };
        }
      });

      const emailResults = await Promise.all(emailPromises);
      const emailMap = Object.fromEntries(
        emailResults.map(result => [result.id, result.email])
      );

      // Combine all data
      const driversCombined = profilesData.map((profile) => {
        return {
          ...profile,
          email: emailMap[profile.id],
          status: driverStatusMap[profile.id] ?? "pending",
        };
      });

      console.log("Fetched drivers:", driversCombined);
      setDrivers(driversCombined);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("خطأ في جلب بيانات السائقين");
    } finally {
      setLoading(false);
    }
  };

  // Function to navigate to driver details
  const navigateToDriverDetails = (driverId: string) => {
    navigate(`/admin/driver-details/${driverId}`);
  };

  // Initial fetch
  useEffect(() => {
    fetchDrivers();
  }, []);

  // Add an effect to refresh data when returning from other pages
  useEffect(() => {
    const handleFocus = () => {
      console.log("Window focused - refreshing driver data");
      fetchDrivers();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const filteredDrivers = drivers.filter(driver => {
    const matchesStatus = currentTab === "all" || driver.status === currentTab;
    const matchesSearch = !searchEmail || 
      (driver.email && driver.email.toLowerCase().includes(searchEmail.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 flex flex-col min-h-svh">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة السائقين</h1>
        <Button 
          variant="outline" 
          onClick={fetchDrivers} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          تحديث البيانات
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative w-full max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="البحث بالبريد الإلكتروني..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <Tabs value={currentTab} onValueChange={(value) => {
          setCurrentTab(value);
          // Refresh data when changing tabs
          console.log("Tab changed to:", value);
          fetchDrivers();
        }}>
          <TabsList>
            <TabsTrigger value="pending">قيد المراجعة</TabsTrigger>
            <TabsTrigger value="approved">مقبول</TabsTrigger>
            <TabsTrigger value="rejected">مرفوض</TabsTrigger>
            <TabsTrigger value="all">الكل</TabsTrigger>
          </TabsList>
          
          <TabsContent value={currentTab}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم الأول</TableHead>
                  <TableHead>اسم العائلة</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>{driver.first_name}</TableCell>
                    <TableCell>{driver.last_name}</TableCell>
                    <TableCell>{driver.email || "-"}</TableCell>
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

                {filteredDrivers.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      لا يوجد سائقين للعرض
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DriverVerification;
