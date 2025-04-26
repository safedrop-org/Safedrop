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
import { Badge } from "@/components/ui/badge";
interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: string | null;
  email?: string | null;
  user_type: string;
}
interface DriverStatusCategory {
  name: string;
  display_name_ar: string;
  color: string;
}
const DriverVerification = () => {
  const {
    t
  } = useLanguage();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [statusCategories, setStatusCategories] = useState<DriverStatusCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [currentTab, setCurrentTab] = useState("pending");
  const navigate = useNavigate();
  const fetchDriverStatusCategories = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("driver_status_categories").select("name, display_name_ar, color");
      if (error) throw error;
      setStatusCategories(data || []);
    } catch (error) {
      console.error("Error fetching driver status categories:", error);
      toast.error("حدث خطأ أثناء جلب فئات حالة السائقين");
    }
  };
  const fetchDrivers = async () => {
    setLoading(true);
    try {
      console.log("Fetching drivers...");
      const {
        data: roleMappings,
        error: roleError
      } = await supabase.from("user_roles").select("user_id").eq("role", "driver");
      if (roleError) {
        console.error("Error fetching driver roles:", roleError);
      }
      const driverRoleIds = roleMappings ? roleMappings.map(r => r.user_id) : [];
      console.log("Found users with driver role:", driverRoleIds.length);
      let profilesQuery = supabase.from("profiles").select("id, first_name, last_name, phone, user_type, email");
      if (driverRoleIds.length > 0) {
        profilesQuery = profilesQuery.or(`user_type.eq.driver,id.in.(${driverRoleIds.join(',')})`);
      } else {
        profilesQuery = profilesQuery.eq("user_type", "driver");
      }
      const {
        data: profilesData,
        error: profilesError
      } = await profilesQuery;
      if (profilesError) throw profilesError;
      console.log("Profiles data fetched:", profilesData?.length || 0);
      if (!profilesData || profilesData.length === 0) {
        setDrivers([]);
        setLoading(false);
        return;
      }
      const driverIds = profilesData.map(d => d.id);
      const {
        data: driversData,
        error: driversError
      } = await supabase.from("drivers").select("id, status").in("id", driverIds);
      if (driversError) throw driversError;
      console.log("Driver status data fetched:", driversData?.length || 0);
      const driverStatusMap = {};
      if (driversData) {
        driversData.forEach(driver => {
          driverStatusMap[driver.id] = driver.status;
        });
      }
      const driversCombined = profilesData.map(profile => {
        return {
          ...profile,
          status: driverStatusMap[profile.id] ?? "pending"
        };
      });
      console.log("Combined driver data:", driversCombined.length);
      setDrivers(driversCombined);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("خطأ في جلب بيانات السائقين");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDriverStatusCategories();
    fetchDrivers();
  }, []);
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
    const matchesSearch = !searchEmail || driver.email && driver.email.toLowerCase().includes(searchEmail.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  const navigateToDriverDetails = (driverId: string) => {
    navigate(`/admin/driver-details/${driverId}`);
  };
  const getStatusBadgeColor = (status: string) => {
    const category = statusCategories.find(cat => cat.name === status);
    return category ? category.color : "gray";
  };
  return <div className="p-6 flex flex-col min-h-svh">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة السائقين</h1>
        <Button variant="outline" onClick={fetchDrivers} disabled={loading} className="flex items-center gap-2">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          تحديث البيانات
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative w-full max-w-sm mb-4">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input type="text" placeholder="البحث بالبريد الإلكتروني..." value={searchEmail} onChange={e => setSearchEmail(e.target.value)} className="pr-10 w-full" />
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="flex justify-end space-x-2 space-x-reverse">
            <TabsTrigger value="pending">في الانتظار</TabsTrigger>
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
                {filteredDrivers.map(driver => {
                const statusCategory = statusCategories.find(cat => cat.name === driver.status);
                return <TableRow key={driver.id}>
                      <TableCell>{driver.first_name}</TableCell>
                      <TableCell>{driver.last_name}</TableCell>
                      <TableCell>{driver.email || "-"}</TableCell>
                      <TableCell>{driver.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`bg-${statusCategory?.color}-50 text-${statusCategory?.color}-600`}>
                          {statusCategory?.display_name_ar || driver.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigateToDriverDetails(driver.id)}>
                          <Eye size={16} className="ml-1" /> عرض التفاصيل
                        </Button>
                      </TableCell>
                    </TableRow>;
              })}

                {filteredDrivers.length === 0 && !loading && <TableRow>
                    <TableCell colSpan={6} className="text-center">لا يوجد سائقون للعرض</TableCell>
                  </TableRow>}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default DriverVerification;