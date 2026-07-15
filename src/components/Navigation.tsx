
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
import { useSidebar } from "@/contexts/SidebarContext";
import { useThemeLogo } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const logoUrl = useThemeLogo();
  const navigate = useNavigate();

  const navItems = [
    { id: "planner", label: t("dashboard.nav.planner"), icon: Calendar },
    { id: "ai-meals", label: t("dashboard.nav.meals"), icon: CookingPot },
    { id: "ai-drinks", label: t("dashboard.nav.drinks"), icon: CupSoda },
    { id: "ingredients", label: t("dashboard.nav.pantry"), icon: Package },
    ...(isMobile ? [] : [{ id: "profile", label: t("dashboard.nav.profile"), icon: User }]),
  ];

  const getButtonStyles = (item: any, isActive: boolean) => {
    const baseStyles = "transition-all duration-200";
    
    if (isActive) {
      return `${baseStyles} bg-primary text-primary-foreground shadow-lg`;
    }
    
    return `${baseStyles} text-muted-foreground hover:bg-accent hover:text-accent-foreground`;
  };

  if (isMobile) {
    // Mobile Bottom Tab Navigation
    return (
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t border-white/10 shadow-2xl"
        style={{
          background:
            "linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary)), hsl(var(--accent)))",
        }}
      >
        <div className="relative flex justify-around items-center py-2 px-2">
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onTabChange(item.id)}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center min-w-0 flex-1 h-14 px-1 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-black/30 text-white shadow-lg ring-1 ring-white/20"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
                <span className="text-[10px] mt-0.5 leading-tight truncate max-w-full">{item.label}</span>
              </Button>
            );
          })}

          {/* Central AI Assistant FAB */}
          <button
            type="button"
            onClick={() => navigate("/assistant")}
            aria-label="prefud AI Assistant"
            className="mx-1 -mt-6 h-14 w-14 rounded-full bg-white text-primary shadow-xl ring-2 ring-white/60 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Bot className="h-7 w-7" />
          </button>

          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onTabChange(item.id)}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center min-w-0 flex-1 h-14 px-1 rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-black/30 text-white shadow-lg ring-1 ring-white/20"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
                <span className="text-[10px] mt-0.5 leading-tight truncate max-w-full">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    );
  }

  // Desktop Sidebar Navigation with collapse functionality
  return (
    <nav
      className={cn(
        "fixed left-0 top-0 h-full backdrop-blur-md border-r border-white/10 shadow-2xl z-40 flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
      style={{ backgroundColor: "hsl(var(--sidebar-primary))" }}
    >
      {/* Sidebar Header - aligned with dashboard header height */}
      <div className={cn(
        "border-b border-white/10 transition-all duration-300 h-20 flex items-center",
        isCollapsed ? "px-3 justify-center" : "px-6 justify-between"
      )}>
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="p-2 bg-white/15 rounded-lg shadow-lg">
              <CookingPot className="h-6 w-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <img
                src={logoUrl}
                alt="prefud"
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-2 space-y-1">
        <Button
          variant="ghost"
          onClick={() => navigate("/assistant")}
          aria-label="prefud AI Assistant"
          className={cn(
            "transition-all duration-300 rounded-xl bg-white/15 text-white hover:bg-white/25",
            isCollapsed ? "w-full h-12 px-0 justify-center" : "w-full justify-start h-12 px-4"
          )}
          title={isCollapsed ? "AI Assistant" : undefined}
        >
          <Bot className={cn("h-5 w-5", !isCollapsed && "mr-3")} aria-hidden="true" />
          {!isCollapsed && <span className="text-sm font-medium">AI Assistant</span>}
        </Button>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange(item.id)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "transition-all duration-300 rounded-xl",
                isCollapsed 
                  ? "w-full h-12 px-0 justify-center" 
                  : "w-full justify-start h-12 px-4",
                isActive
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} aria-hidden="true" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Button>
          );
        })}
      </div>

      {/* Kitchen Decoration - moved up */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <div aria-hidden="true" className="w-2 h-2 bg-white/60 rounded-full motion-safe:animate-pulse"></div>
            <div aria-hidden="true" className="w-2 h-2 bg-white/40 rounded-full motion-safe:animate-pulse delay-500"></div>
            <div aria-hidden="true" className="w-2 h-2 bg-white/60 rounded-full motion-safe:animate-pulse delay-1000"></div>
          </div>
        </div>
      )}

      {/* Collapse/Expand Toggle - moved to bottom */}
      <div className={cn(
        "border-t border-white/10",
        isCollapsed ? "p-2" : "p-4"
      )}>
        <Button
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          className={cn(
            "text-white/75 hover:bg-white/10 hover:text-white transition-all duration-300 rounded-xl",
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
