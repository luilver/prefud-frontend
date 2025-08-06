
import { Button } from "@/components/ui/button";
import {
  Calendar,
  TrendingUp,
  ShoppingCart,
  Package,
  User,
  Sparkles,
  Leaf,
  CookingPot,
  CupSoda,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: "planner", label: t("dashboard.nav.planner"), icon: Calendar },
    { id: "ai-meals", label: t("dashboard.nav.meals"), icon: CookingPot },
    { id: "ai-drinks", label: t("dashboard.nav.drinks"), icon: CupSoda },
    { id: "ingredients", label: t("dashboard.nav.pantry"), icon: Package },
    { id: "profile", label: t("dashboard.nav.profile"), icon: User },
  ];

  const getButtonStyles = (item: any, isActive: boolean) => {
    const baseStyles = "transition-all duration-200";
    
    if (isActive) {
      if (item.id === "ai-meals") return `${baseStyles} bg-purple-600 text-white shadow-lg`;
      if (item.id === "ai-drinks") return `${baseStyles} bg-blue-600 text-white shadow-lg`;
      return `${baseStyles} bg-green-600 text-white shadow-lg`;
    }
    
    if (item.id === "ai-meals") return `${baseStyles} text-purple-700 hover:bg-purple-100`;
    if (item.id === "ai-drinks") return `${baseStyles} text-blue-700 hover:bg-blue-100`;
    return `${baseStyles} text-green-700 hover:bg-green-100`;
  };

  if (isMobile) {
    // Mobile Bottom Tab Navigation
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-green-200/60 shadow-lg">
        <div className="flex justify-around items-center py-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-0 flex-1 h-14 px-1",
                  getButtonStyles(item, isActive)
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    );
  }

  // Desktop Sidebar Navigation with collapse functionality
  return (
    <nav className={cn(
      "fixed left-0 top-0 h-full bg-white/90 backdrop-blur-md border-r border-green-200/60 shadow-lg z-40 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Sidebar Header */}
      <div className={cn(
        "border-b border-green-200/60 transition-all duration-300",
        isCollapsed ? "p-3" : "p-6"
      )}>
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
              <CookingPot className="h-6 w-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
                <CookingPot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-green-700 to-orange-600 bg-clip-text text-transparent">
                  Pantry
                </h2>
                <p className="text-sm text-green-600/80">Smart Kitchen</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "transition-all duration-200 rounded-lg",
                isCollapsed 
                  ? "w-full h-12 px-0 justify-center" 
                  : "w-full justify-start h-12 px-4",
                getButtonStyles(item, isActive)
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Button>
          );
        })}
      </div>

      {/* Kitchen Decoration - moved up */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="flex items-center justify-center space-x-2 text-green-500/30">
            <div className="w-2 h-2 bg-green-300/40 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-orange-300/40 rounded-full animate-pulse delay-500"></div>
            <div className="w-2 h-2 bg-green-300/40 rounded-full animate-pulse delay-1000"></div>
          </div>
        </div>
      )}

      {/* Collapse/Expand Toggle - moved to bottom */}
      <div className={cn(
        "border-t border-green-200/60",
        isCollapsed ? "p-2" : "p-4"
      )}>
        <Button
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "text-green-700 hover:bg-green-100/60 transition-all duration-200",
            isCollapsed ? "w-full h-10 px-2" : "w-full justify-start h-10 px-3"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
