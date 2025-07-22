
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, ShoppingCart, Package, User, Sparkles, Leaf, CookingPot, CupSoda } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { t } = useLanguage();
  
  const navItems = [
    { id: "planner", label: t('nav.planner'), icon: Calendar },
    { id: "ai-meals", label: t('nav.meals'), icon: CookingPot },
    { id: "ai-drinks", label: t('nav.drinks'), icon: CupSoda },
    { id: "ingredients", label: t('nav.pantry'), icon: Package },
    { id: "shopping", label: t('nav.shopping'), icon: ShoppingCart },
    { id: "environment", label: t('nav.environment'), icon: Leaf },
    { id: "calories", label: t('nav.calories'), icon: TrendingUp },
    { id: "highlights", label: t('nav.highlights'), icon: Sparkles },
    { id: "profile", label: t('nav.profile'), icon: User },
  ];

  return (
    <nav className="bg-white border-t border-gray-200">
      <div className="grid grid-cols-4 md:grid-cols-9 gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center space-y-1 h-auto py-2 px-1 text-xs ${
                activeTab === item.id 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate w-full text-center">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
