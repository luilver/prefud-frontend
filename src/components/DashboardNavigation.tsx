
import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Sparkles, 
  Utensils, 
  Package2, 
  ShoppingCart, 
  Target, 
  User, 
  Lightbulb,
  Leaf
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardNavigationProps {
  activeTab: string;
  onTabChange: Dispatch<SetStateAction<string>>;
}

const DashboardNavigation = ({ activeTab, onTabChange }: DashboardNavigationProps) => {
  const { t } = useLanguage();

  const navItems = [
    { id: "planner", icon: Calendar, label: t("nav.mealPlanner") },
    { id: "ai-meals", icon: Sparkles, label: t("nav.aiMeals") },
    { id: "ai-drinks", icon: Utensils, label: t("nav.aiDrinks") },
    { id: "highlights", icon: Lightbulb, label: t("nav.highlights") },
    { id: "environment", icon: Leaf, label: t("nav.environment") },
    { id: "ingredients", icon: Package2, label: t("nav.ingredients") },
    { id: "shopping", icon: ShoppingCart, label: t("nav.shopping") },
    { id: "calories", icon: Target, label: t("nav.calories") },
    { id: "profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <nav className="bg-white/60 backdrop-blur-sm border-b border-green-100">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 sm:py-3 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                onClick={() => onTabChange(item.id)}
                className={`
                  flex-shrink-0 flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base font-medium rounded-lg transition-all duration-200
                  ${activeTab === item.id 
                    ? "bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-lg transform scale-105" 
                    : "text-green-700 hover:bg-green-50 hover:text-green-800"
                  }
                `}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                <span className="hidden sm:block whitespace-nowrap">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavigation;
