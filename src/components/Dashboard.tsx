
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
              {user?.name || 'User'}
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
        {/* Welcome Section - Only show on planner tab */}
        {activeTab === "planner" && (
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                Welcome back, {user?.name || 'User'}!
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                You have <span className="font-semibold text-green-600">{user?.subscription.planLimits.plansPerMonth - (user?.subscription.planLimits.usedPlans || 0)}</span> meal plans remaining this month.
              </p>
            </div>
            
            {/* Main Action Card */}
            <Card className="bg-gradient-to-r from-green-500/10 via-orange-500/10 to-purple-500/10 border-green-300 max-w-2xl mx-auto">
              <CardHeader className="text-center p-4 sm:p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-green-500 to-orange-500 rounded-xl">
                    <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-800 mb-2">Your Meal Plans</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-gray-600">
                      Plan your week with AI-powered suggestions and manage your meals
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <Button 
                      onClick={handleStartPlanning}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex-1"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      View Plans
                    </Button>
                    <Button 
                      onClick={handleStartPlanning}
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50 flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Plan
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Tab Content */}
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="planner" className="mt-4 sm:mt-6">
            <div id="meal-planner-section">
              <MealPlanner />
            </div>
          </TabsContent>

          <TabsContent value="highlights" className="mt-4 sm:mt-6">
            <Highlights />
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
