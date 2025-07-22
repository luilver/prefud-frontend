
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Utensils, ChefHat, Sparkles, Plus } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("planner");
  const { user, logout } = useUser();

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-green-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
              <Utensils className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
              Pantry
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-sm sm:text-base text-green-700 font-medium hidden sm:block">
             Welcome {user?.name || 'User'} !
            </span>
            <span className="text-xs text-green-700 font-medium sm:hidden">
             {user?.name?.split(' ')[0] || 'User'}
            </span>
            <Button variant="ghost" onClick={logout} className="text-green-700 text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-1 sm:py-2">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6 lg:py-8">
        {/* Tab Content */}
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="planner" className="mt-4 sm:mt-6">
            <div id="meal-planner-section">
              <MealPlanner />
            </div>
          </TabsContent>

          <TabsContent value="ai-meals" className="mt-4 sm:mt-6">
            <AIMealCreator />
          </TabsContent>

          <TabsContent value="ai-drinks" className="mt-4 sm:mt-6">
            <AIDrinkCreator />
          </TabsContent>

          <TabsContent value="highlights" className="mt-4 sm:mt-6">
            <Highlights />
          </TabsContent>

          <TabsContent value="environment" className="mt-4 sm:mt-6">
            <Environment />
          </TabsContent>

          <TabsContent value="ingredients" className="mt-4 sm:mt-6">
            <IngredientTracker />
          </TabsContent>

          <TabsContent value="shopping" className="mt-4 sm:mt-6">
            <ShoppingList />
          </TabsContent>

          <TabsContent value="calories" className="mt-4 sm:mt-6">
            <CalorieTracker />
          </TabsContent>

          <TabsContent value="profile" className="mt-4 sm:mt-6">
            <div className="grid gap-4 sm:gap-6">
              <UserProfile />
              <SubscriptionManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
