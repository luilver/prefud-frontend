
import { useLanguage } from "@/contexts/LanguageContext";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  currentPage: number;
  totalPages: number;
  itemCount: number;
  itemLabel?: string;
  className?: string;
}

const PageSizeSelector = ({
  pageSize,
  onPageSizeChange,
  currentPage,
  totalPages,
  itemCount,
  itemLabel,
  className = "",
}: PageSizeSelectorProps) => {
  const { t } = useLanguage();
  const label = itemLabel || t("pagination.items") || "items";

  return (
    <div
      className={`flex items-center justify-between gap-3 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 w-full max-w-md mx-auto ${className}`}
    >
      <div className="flex items-center gap-2 text-sm text-white/90">
        <span>{t("pagination.show") || "Show"}</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
          className="bg-white/20 text-white border border-white/30 rounded-md px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer appearance-none text-center w-14"
        >
          <option value={3} className="text-gray-800">3</option>
          <option value={5} className="text-gray-800">5</option>
          <option value={10} className="text-gray-800">10</option>
        </select>
        <span>{t("pagination.perPage") || "per page"}</span>
      </div>
      <div className="text-sm text-white/80 whitespace-nowrap">
        {currentPage}/{totalPages} ({itemCount} {label})
      </div>
    </div>
  );
};

export default PageSizeSelector;
