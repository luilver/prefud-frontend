
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

const PageSizeSelector = ({ pageSize, onPageSizeChange, className = "" }: PageSizeSelectorProps) => {
  const { t } = useLanguage();
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-600"> {t("pagination.show") || "Show"}</span>
      <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="3">3</SelectItem>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="10">10</SelectItem>
        </SelectContent>
      </Select>
      <span className="text-sm text-gray-600"> {t("pagination.perPage") || "per page"}</span>
    </div>
  );
};

export default PageSizeSelector;
