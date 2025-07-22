
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
    { id: "planner", label: t('dashboard.nav.planner'), icon: Calendar },
    { id: "ai-meals", label: t('dashboard.nav.meals'), icon: CookingPot },
    { id: "ai-drinks", label: t('dashboard.nav.drinks'), icon: CupSoda },
    { id: "ingredients", label: t('dashboard.nav.pantry'), icon: Package },
    { id: "shopping", label: t('dashboard.nav.shopping'), icon: ShoppingCart },
    { id: "environment", label: t('dashboard.nav.environment'), icon: Leaf },
    { id: "calories", label: t('dashboard.nav.calories'), icon: TrendingUp },
    { id: "highlights", label: t('dashboard.nav.highlights'), icon: Sparkles },
    { id: "profile", label: t('dashboard.nav.profile'), icon: User },
  ];

  return (
    <nav className="bg-white/70 backdrop-blur-sm border-b border-green-200">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 sm:py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onTabChange(item.id)}
                className={`
                  flex items-center space-x-1 sm:space-x-2 whitespace-nowrap min-w-fit
                  text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2
                  ${isActive 
                    ? item.id === "ai-meals" 
                      ? "bg-purple-600 text-white shadow-md" 
                      : item.id === "ai-drinks"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-green-600 text-white shadow-md"
                    : item.id === "ai-meals"
                      ? "text-purple-700 hover:bg-purple-100"
                      : item.id === "ai-drinks"
                        ? "text-blue-700 hover:bg-blue-100"
                        : "text-green-700 hover:bg-green-100"
                  }
                `}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
