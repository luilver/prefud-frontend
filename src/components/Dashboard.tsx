
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Utensils, ChefHat, Sparkles, Plus } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/contexts/SidebarContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Navigation from "./Navigation";
import MealPlanner from "./MealPlanner";
import CalorieTracker from "./CalorieTracker";
import IngredientTracker from "./IngredientTracker";
import ShoppingList from "./ShoppingList";
import UserProfile from "./UserProfile";
import SubscriptionManager from "./SubscriptionManager";
import Highlights from "./Highlights";
import Environment from "./Environment";
import AIMealCreator from "./AIMealCreator";
import AIDrinkCreator from "./AIDrinkCreator";
import LanguageSelector from "./LanguageSelector";

const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState("planner");
  const { user, logout } = useUser();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { isCollapsed } = useSidebar();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-orange-25/60 to-green-75/40 relative overflow-hidden">
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
        
        <div className="absolute top-20 left-[10%] w-6 h-6 bg-green-200/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-[15%] w-4 h-4 bg-orange-200/25 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-[20%] w-5 h-5 bg-green-300/15 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-[25%] w-3 h-3 bg-orange-300/20 rounded-full animate-pulse delay-3000"></div>
      </div>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Header for Desktop (with dynamic positioning) */}
      {!isMobile && (
        <header className="fixed top-0 right-0 bg-white/90 backdrop-blur-md border-b border-green-200/60 z-30 transition-all duration-300"
          style={{ left: `${getSidebarWidth()}px` }}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-orange-50 rounded-lg border border-green-200/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 font-medium">
                    {t('dashboard.header.welcome')} {user?.name?.split(' ')[0] || 'Chef'}!
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <LanguageSelector variant="button" />
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="text-green-700 hover:bg-green-100/60"
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
        <header className="relative bg-white/90 backdrop-blur-md border-b border-green-200/60 sticky top-0 z-50 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-orange-400/5 to-green-600/5"></div>
          <div className="relative container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Enhanced Logo with Kitchen Feel */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 rounded-xl blur-sm opacity-20"></div>
                  <div className="relative p-2.5 sm:p-3 bg-gradient-to-r from-green-500 to-orange-500 rounded-xl shadow-lg">
                    <Utensils className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-700 via-green-600 to-orange-600 bg-clip-text text-transparent">
                    Pantry
                  </h1>
                  <p className="text-xs sm:text-sm text-green-600/80 font-medium hidden sm:block">Smart Kitchen Assistant</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 sm:space-x-4">
                <LanguageSelector variant="button" className="mr-1 sm:mr-2" />
                
                {/* Mobile Welcome */}
                <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-md">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-700 font-medium">
                    {user?.name?.split(' ')[0] || 'Chef'}
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  onClick={logout} 
                  className="text-green-700 hover:bg-green-100/60 text-xs sm:text-sm lg:text-base px-3 sm:px-4 py-2 rounded-lg transition-all duration-200"
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
        className={`relative min-h-screen transition-all duration-300 ${isMobile ? 'mb-20' : 'mt-16'}`}
        style={!isMobile ? { marginLeft: `${getSidebarWidth()}px` } : {}}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          {/* Kitchen-inspired content wrapper */}
          <div className="relative">
            {/* Subtle content background */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl"></div>
            
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
