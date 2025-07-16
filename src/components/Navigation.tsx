
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, ShoppingCart, Package, User, Sparkles, Leaf, Coffee } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const navItems = [
    { id: "planner", label: "Planner", icon: Calendar },
    { id: "drinks", label: "Drinks", icon: Coffee },
    { id: "highlights", label: "Highlights", icon: Sparkles },
    { id: "environment", label: "Environment", icon: Leaf },
    { id: "ingredients", label: "Pantry", icon: Package },
    { id: "shopping", label: "Shopping", icon: ShoppingCart },
    { id: "calories", label: "Calories", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: User },
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
                    ? "bg-green-600 text-white shadow-md" 
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
