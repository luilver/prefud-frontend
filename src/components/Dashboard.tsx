
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Utensils, ChefHat, Sparkles, Plus, ShoppingCart } from "lucide-react";
import dashboardBg from "@/assets/dashboard-bg.jpg";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/contexts/SidebarContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import MealPlanner from "./MealPlanner";
import CalorieTracker from "./CalorieTracker";
import IngredientTracker from "./IngredientTracker";
import ShoppingList from "./ShoppingList";
import UserProfile from "./UserProfile";
import SubscriptionManager from "./SubscriptionManager";
import { isNativePlatform } from "@/services/revenueCatService";
import Highlights from "./Highlights";
import Environment from "./Environment";
import AIMealCreator from "./AIMealCreator";
import AIDrinkCreator from "./AIDrinkCreator";
import Reels from "./Reels";
import LanguageSelector from "./LanguageSelector";

const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState("planner");
  const { user, logout } = useUser();
  const { t } = useLanguage();
  const { getTotalItems } = useCart();
  const isMobile = useIsMobile();
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();

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
        <header className="fixed top-0 right-0 bg-gradient-to-r from-emerald-900/95 via-emerald-800/95 to-teal-900/95 backdrop-blur-md border-b border-emerald-500/30 z-30 transition-all duration-300 shadow-xl"
          style={{ left: `${getSidebarWidth()}px` }}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab("profile")}
                  className="flex items-center space-x-2 px-3 py-2 bg-emerald-700/40 rounded-lg border border-emerald-500/30 hover:bg-emerald-600/50 transition-colors cursor-pointer"
                >
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white font-medium">
                    {t('dashboard.header.welcome')} {user?.name?.split(' ')[0] || 'Chef'}!
                  </span>
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                <LanguageSelector variant="button" />
                
                {/* Cart Icon with Badge */}
                <Button
                  variant="ghost"
                  onClick={handleCartClick}
                  className="relative text-emerald-200 hover:bg-emerald-700/40 hover:text-white"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="text-emerald-200 hover:bg-emerald-700/40 hover:text-white"
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
        <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-emerald-900/95 via-emerald-800/95 to-teal-900/95 backdrop-blur-md border-b border-emerald-500/30 z-50 shadow-xl pt-[env(safe-area-inset-top)]">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-400/5 to-emerald-600/5"></div>
          <div className="relative container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Enhanced Logo with Kitchen Feel */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur-sm opacity-40"></div>
                  <div className="relative p-2.5 sm:p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/30">
                    <Utensils className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    Pantry
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-300/80 font-medium hidden sm:block">Smart Kitchen Assistant</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 sm:space-x-4">
                <LanguageSelector variant="button" className="mr-1 sm:mr-2" />
                
                {/* Cart Icon with Badge for Mobile */}
                <Button
                  variant="ghost"
                  onClick={handleCartClick}
                  className="relative text-emerald-200 hover:bg-emerald-700/40 hover:text-white w-8 h-8 p-0"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-lg">
                      {getTotalItems() > 9 ? '9+' : getTotalItems()}
                    </span>
                  )}
                </Button>
                
                {/* Mobile Welcome - Now clickable to navigate to profile */}
                <button
                  onClick={handleUserNameClick}
                  className="flex items-center justify-center w-8 h-8 bg-emerald-700/40 rounded-full hover:bg-emerald-600/50 transition-colors border border-emerald-500/30"
                >
                  <span className="text-xs text-white font-medium">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                  </span>
                </button>
                
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="text-emerald-200 hover:bg-emerald-700/40 hover:text-white text-xs sm:text-sm lg:text-base px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 hidden md:block"
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
                <TabsContent value="reels" className="mt-0">
                  <div className="space-y-6">
                    <Reels />
                  </div>
                </TabsContent>

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
                    {!isNative && <SubscriptionManager />}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
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
