import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Download } from 'lucide-react';
import { useLanguage } from '@/components/ui/language-context';

interface AdminSearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterIssueType: string;
  onFilterChange: (value: string) => void;
  onExport: () => void;
  disableExport?: boolean;
  showIssueTypeFilter?: boolean;
}

export const AdminSearchAndFilters: React.FC<AdminSearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterIssueType,
  onFilterChange,
  onExport,
  disableExport = false,
  showIssueTypeFilter = true,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
      {/* Search */}
      <div className="relative flex-1 lg:w-80">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={t("searchComplaints")}
          className="pr-10 text-left"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Issue Type Filter */}
      {showIssueTypeFilter && (
        <Select
          defaultValue={filterIssueType}
          onValueChange={onFilterChange}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder={t("issueType")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTypes")}</SelectItem>
            <SelectItem value="login">{t("issueTypeLogin")}</SelectItem>
            <SelectItem value="order">{t("issueTypeOrder")}</SelectItem>
            <SelectItem value="payment">{t("issueTypePayment")}</SelectItem>
            <SelectItem value="driver">{t("issueTypeDriver")}</SelectItem>
            <SelectItem value="customer">{t("issueTypeCustomer")}</SelectItem>
            <SelectItem value="other">{t("issueTypeOther")}</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Export Button */}
      <Button
        variant="outline"
        className="gap-2 whitespace-nowrap"
        onClick={onExport}
        disabled={disableExport}
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">
          {t("exportComplaints")}
        </span>
        <span className="sm:hidden">{t("export")}</span>
      </Button>
    </div>
  );
};
