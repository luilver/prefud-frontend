import { Button } from "@/components/ui/button";
import {
  ChefHat,
  BarChart3,
  Utensils,
  ShoppingCart,
  TrendingUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const navItems = [
    { id: "planner", label: "Meal Plans", icon: ChefHat, shortLabel: "Plans" },

    {
      id: "ingredients",
      label: "Pantry",
      icon: Utensils,
      shortLabel: "Pantry",
    },
    {
      id: "shopping",
      label: "Shopping",
      icon: ShoppingCart,
      shortLabel: "Shop",
    },
    { id: "calories", label: "Calories", icon: TrendingUp, shortLabel: "Cals" },
    { id: "profile", label: "Profile", icon: User, shortLabel: "Profile" },
    {
      id: "highlights",
      label: "Highlights",
      icon: BarChart3,
      shortLabel: "Stats",
    },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-green-200 sticky top-16 z-40">
      {/* Desktop Navigation */}
      <div className="hidden sm:flex container mx-auto px-4 py-2">
        <div className="flex space-x-1 w-full">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all",
                activeTab === item.id
                  ? "bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-md"
                  : "text-gray-600 hover:text-green-700 hover:bg-green-50"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden px-2 py-2">
        <div className="flex overflow-x-auto scrollbar-hide space-x-1 pb-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center space-y-1 min-w-[4rem] px-3 py-2 text-xs font-medium transition-all flex-shrink-0",
                activeTab === item.id
                  ? "bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-md"
                  : "text-gray-600 hover:text-green-700 hover:bg-green-50"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-[10px] leading-tight">
                {item.shortLabel}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
