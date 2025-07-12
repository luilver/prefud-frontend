
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import Highlights from "@/components/Highlights";
import MealPlanCalendar from "@/components/MealPlanCalendar";
import ShoppingList from "@/components/ShoppingList";
import { useEffect } from "react";

const Index = () => {
  const { isAuthenticated, user, checkSubscription } = useUser();

  useEffect(() => {
    checkSubscription();
  }, [isAuthenticated, checkSubscription]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Utensils className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-800">PantryPal</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/why-pantry" className="text-gray-600 hover:text-green-600 transition-colors">
                  Why Pantry?
                </Link>
                <Link to="/pricing" className="text-gray-600 hover:text-green-600 transition-colors">
                  Pricing
                </Link>
                <Link to="/signin">
                  <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Smart Meal Planning Made Simple
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your kitchen with AI-powered meal planning, reduce food waste, save money, and eat healthier with PantryPal.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>

        {/* Simple Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why PantryPal?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Save time, money, and reduce food waste with intelligent meal planning
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Planning</h3>
              <p className="text-gray-600">AI-powered meal suggestions based on your pantry</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reduce Waste</h3>
              <p className="text-gray-600">Use ingredients before they expire</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Money</h3>
              <p className="text-gray-600">Shop smarter with automated lists</p>
            </div>
          </div>
        </div>

        {/* Simple Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 PantryPal. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Utensils className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-800">PantryPal</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/why-pantry" className="text-gray-600 hover:text-green-600 transition-colors">
                Why Pantry?
              </Link>
              <Link to="/pricing" className="text-gray-600 hover:text-green-600 transition-colors">
                Pricing
              </Link>
              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                {user?.email}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome, {user?.name}!
        </h2>

        <Highlights />

        <MealPlanCalendar />

        <ShoppingList />
      </div>

      {/* Simple Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 PantryPal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
