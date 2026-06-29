
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ChefHat, Sparkles, Plus, ShoppingCart } from "lucide-react";
import dashboardBg from "@/assets/dashboard-bg.jpg";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/contexts/SidebarContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import { useThemeLogo } from "@/contexts/ThemeContext";
import MealPlanner from "./MealPlanner";
import CalorieTracker from "./CalorieTracker";
import IngredientTracker from "./IngredientTracker";
import ShoppingList from "./ShoppingList";
import UserProfile from "./UserProfile";
import SubscriptionManager from "./SubscriptionManager";
import { isNativePlatform } from "@/services/revenueCatService";
import WelcomeModal from "./WelcomeModal";
import Highlights from "./Highlights";
import Environment from "./Environment";
import AIMealCreator from "./AIMealCreator";
import AIDrinkCreator from "./AIDrinkCreator";

import LanguageSelector from "./LanguageSelector";

const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState("planner");
  const { user, logout } = useUser();
  const { t } = useLanguage();
  const { getTotalItems } = useCart();
  const isMobile = useIsMobile();
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();
  const isNative = isNativePlatform();
  const [showWelcome, setShowWelcome] = useState(false);
  const logoUrl = useThemeLogo();
  const themeGradient =
    "linear-gradient(to right, hsl(var(--primary) / 0.95), hsl(var(--primary) / 0.9), hsl(var(--accent) / 0.95))";

  useEffect(() => {
    try {
      if (localStorage.getItem("pantry_show_welcome") === "1") {
        setShowWelcome(true);
      }
    } catch (e) {
      console.warn("Could not read welcome flag", e);
    }
  }, []);

  const handleWelcomeClose = () => {
    try {
      localStorage.removeItem("pantry_show_welcome");
    } catch (e) {
      console.warn("Could not clear welcome flag", e);
    }
    setShowWelcome(false);
  };

  // Handle hash navigation to switch tabs
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'profile') {
        setActiveTab('profile');
        // Clear the hash after navigation
        window.location.hash = '';
      }
    };

    // Check hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Scroll to top when active tab changes on mobile
  useEffect(() => {
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab, isMobile]);

  // Switch to the planner tab when a global open-meal-plan event fires
  useEffect(() => {
    const handler = () => setActiveTab("planner");
    window.addEventListener("open-meal-plan", handler);
    return () => window.removeEventListener("open-meal-plan", handler);
  }, []);

  // Switch to the AI drinks tab when a global open-drink event fires
  useEffect(() => {
    const handler = () => setActiveTab("ai-drinks");
    window.addEventListener("open-drink", handler);
    return () => window.removeEventListener("open-drink", handler);
  }, []);

  // Switch to the AI meals tab when a global open-ai-meal event fires
  useEffect(() => {
    const handler = () => setActiveTab("ai-meals");
    window.addEventListener("open-ai-meal", handler);
    return () => window.removeEventListener("open-ai-meal", handler);
  }, []);

  // Switch to the pantry tab when a global open-pantry-meals event fires
  useEffect(() => {
    const handler = () => setActiveTab("ingredients");
    window.addEventListener("open-pantry-meals", handler);
    return () => window.removeEventListener("open-pantry-meals", handler);
  }, []);

  // Calculate dynamic margin based on sidebar state
  const getSidebarWidth = () => {
    if (isMobile) return 0;
    return isCollapsed ? 64 : 256; // 16*4 = 64px for collapsed, 64*4 = 256px for expanded
  };

  const handleStartPlanning = () => {
    setActiveTab("planner");
    setTimeout(() => {
      const mealPlannerSection = document.getElementById("meal-planner-section");
      if (mealPlannerSection) {
        mealPlannerSection.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }
    }, 100);
  };

  const handleUserNameClick = () => {
    if (isMobile) {
      setActiveTab("profile");
    }
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={isMobile ? { backgroundColor: '#000000' } : { backgroundImage: `url(${dashboardBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Kitchen Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Subtle kitchen pattern overlay */}
        <div 
          className="absolute top-0 left-0 w-full h-full opacity-[0.02]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        />
        
        <div className="absolute top-20 left-[10%] w-6 h-6 bg-emerald-200/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-[15%] w-4 h-4 bg-teal-200/25 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-[20%] w-5 h-5 bg-emerald-300/15 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-[25%] w-3 h-3 bg-teal-300/20 rounded-full animate-pulse delay-3000"></div>
      </div>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Header for Desktop (with dynamic positioning) */}
      {!isMobile && (
        <header
          className="fixed top-0 right-0 backdrop-blur-md border-b border-white/10 z-30 transition-all duration-300 shadow-xl"
          style={{ left: `${getSidebarWidth()}px`, background: themeGradient }}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab("profile")}
                  className="flex items-center space-x-2 px-3 py-2 bg-white/15 rounded-lg border border-white/20 hover:bg-white/25 transition-colors cursor-pointer"
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm text-white font-medium">
                    {t('dashboard.header.welcome')} {user?.name?.split(' ')[0] || 'Chef'}!
                  </span>
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                <LanguageSelector variant="button" />
                
                {/* Cart Icon with Badge - Hidden on native */}
                {!isNative && (
                  <Button
                    variant="ghost"
                    onClick={handleCartClick}
                    className="relative text-white/80 hover:bg-white/15 hover:text-white"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-white text-primary text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                        {getTotalItems()}
                      </span>
                    )}
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="text-white/80 hover:bg-white/15 hover:text-white"
                >
                  {t('dashboard.header.logout')}
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Header for Mobile */}
      {isMobile && (
        <header
          className="fixed top-0 left-0 right-0 backdrop-blur-md border-b border-white/10 z-50 shadow-xl pt-[env(safe-area-inset-top)]"
          style={{ background: themeGradient }}
        >
          <div className="relative container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={logoUrl}
                  alt="prefud"
                  className="h-9 sm:h-10 w-auto brightness-0 invert"
                />
              </div>
              
              <div className="flex items-center space-x-3 sm:space-x-4">
                <LanguageSelector variant="button" className="mr-1 sm:mr-2" />
                
                {/* Cart Icon with Badge for Mobile - Hidden on native */}
                {!isNative && (
                  <Button
                    variant="ghost"
                    onClick={handleCartClick}
                    className="relative text-white/85 hover:bg-white/15 hover:text-white w-8 h-8 p-0"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-white text-primary text-xs font-semibold rounded-full h-4 w-4 flex items-center justify-center shadow-lg">
                        {getTotalItems() > 9 ? '9+' : getTotalItems()}
                      </span>
                    )}
                  </Button>
                )}
                
                {/* Mobile Welcome - Now clickable to navigate to profile */}
                <button
                  onClick={handleUserNameClick}
                  className="flex items-center justify-center w-8 h-8 bg-white/15 rounded-full hover:bg-white/25 transition-colors border border-white/20"
                >
                  <span className="text-xs text-white font-medium">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                  </span>
                </button>
                
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="text-white/85 hover:bg-white/15 hover:text-white text-xs sm:text-sm lg:text-base px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hidden md:block"
                >
                  {t('dashboard.header.logout')}
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content with dynamic positioning */}
      <div 
        className={`relative min-h-screen transition-all duration-300 ${isMobile ? 'pt-20 mb-20' : 'mt-16'}`}
        style={!isMobile ? { marginLeft: `${getSidebarWidth()}px` } : {}}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          {/* Kitchen-inspired content wrapper */}
          <div className="relative">
            {/* Subtle content background */}
            <div className={`absolute inset-0 overflow-hidden ${isMobile ? 'bg-transparent' : 'bg-white/40 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl'}`}>
              {!isMobile && (
                <div 
                  className="absolute inset-0 opacity-[0.06] pointer-events-none"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2310b981' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40M0 0l40 40M40 0L0 40'/%3E%3C/g%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%230d9488' fill-opacity='0.4'/%3E%3Ccircle cx='0' cy='0' r='1' fill='%2310b981' fill-opacity='0.3'/%3E%3Ccircle cx='40' cy='0' r='1' fill='%2310b981' fill-opacity='0.3'/%3E%3Ccircle cx='0' cy='40' r='1' fill='%2310b981' fill-opacity='0.3'/%3E%3Ccircle cx='40' cy='40' r='1' fill='%2310b981' fill-opacity='0.3'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '40px 40px'
                  }}
                />
              )}
            </div>
            
            {/* Tab Content */}
            <div className="relative p-4 sm:p-6 lg:p-8">
              <Tabs value={activeTab} className="w-full">

                <TabsContent value="planner" className="mt-0">
                  <div id="meal-planner-section" className="space-y-6">
                    <MealPlanner />
                  </div>
                </TabsContent>

                <TabsContent value="ai-meals" className="mt-0">
                  <div className="space-y-6">
                    <AIMealCreator />
                  </div>
                </TabsContent>

                <TabsContent value="ai-drinks" className="mt-0">
                  <div className="space-y-6">
                    <AIDrinkCreator />
                  </div>
                </TabsContent>

                <TabsContent value="highlights" className="mt-0">
                  <div className="space-y-6">
                    <Highlights />
                  </div>
                </TabsContent>

                <TabsContent value="environment" className="mt-0">
                  <div className="space-y-6">
                    <Environment />
                  </div>
                </TabsContent>

                <TabsContent value="ingredients" className="mt-0">
                  <div className="space-y-6">
                    <IngredientTracker />
                  </div>
                </TabsContent>

                <TabsContent value="shopping" className="mt-0">
                  <div className="space-y-6">
                    <ShoppingList />
                  </div>
                </TabsContent>

                <TabsContent value="calories" className="mt-0">
                  <div className="space-y-6">
                    <CalorieTracker />
                  </div>
                </TabsContent>

                <TabsContent value="profile" className="mt-0">
                  <div className="grid gap-6">
                    <UserProfile />
                    <SubscriptionManager />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      {showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}
    </div>
  );
};

const Dashboard = () => {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
};

export default Dashboard;
