
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

const PageSizeSelector = ({ pageSize, onPageSizeChange, className = "" }: PageSizeSelectorProps) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-600">Show:</span>
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
      <span className="text-sm text-gray-600">per page</span>
    </div>
  );
};

export default PageSizeSelector;
