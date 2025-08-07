import { Driver } from "../DriverMobileCard";

export const exportDriversToCSV = (
  drivers: Driver[], 
  t: (key: string) => string
) => {
  const headers = [
    t("driverName"),
    t("userType"),
    t("email"),
    t("phone"),
    t("status"),
    t("registrationDate"),
    t("acceptanceDate"),
  ];

  const csvData = drivers.map((driver) => [
    `${driver.first_name || ""} ${driver.last_name || ""}`.trim(),
    driver.user_type,
    driver.email || t("notSpecified"),
    driver.phone,
    driver.status || "pending",
    (() => {
      if (driver.created_at) {
        return new Date(driver.created_at).toLocaleDateString();
      }
      if (driver.profile_created_at) {
        return new Date(driver.profile_created_at).toLocaleDateString();
      }
      return t("notSpecified");
    })(),
    driver.status === "approved" && driver.updated_at
      ? new Date(driver.updated_at).toLocaleDateString()
      : t("notApplicable"),
  ]);

  let csvContent = headers.join(",") + "\n";
  csvData.forEach((row) => {
    csvContent += row.map((field) => `"${field}"`).join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `drivers-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
};
