import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Utensils, Menu } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/components/Dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [showQuickSignIn, setShowQuickSignIn] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleQuickSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-green-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
                Pantry
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/why-pantry')}
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Why Pantry
              </button>
              <button 
                onClick={() => navigate('/pricing')}
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                Pricing
              </button>
              <Button variant="outline" onClick={() => navigate('/signin')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600">
                Get Started
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-4 border-t border-green-200">
              <nav className="flex flex-col space-y-4 pt-4">
                <button 
                  onClick={() => {
                    navigate('/why-pantry');
                    setShowMobileMenu(false);
                  }}
                  className="text-left text-gray-700 hover:text-green-600 transition-colors"
                >
                  Why Pantry
                </button>
                <button 
                  onClick={() => {
                    navigate('/pricing');
                    setShowMobileMenu(false);
                  }}
                  className="text-left text-gray-700 hover:text-green-600 transition-colors"
                >
                  Pricing
                </button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigate('/signin');
                    setShowMobileMenu(false);
                  }}
                  className="justify-start"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => {
                    navigate('/signup');
                    setShowMobileMenu(false);
                  }} 
                  className="justify-start bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                >
                  Get Started
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Take Control of Your Kitchen
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Simplify meal planning, reduce food waste, and save money with our
            intuitive pantry management system.
          </p>
          <Button
            size="lg"
            onClick={() => setShowQuickSignIn(true)}
            className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white"
          >
            Quick Sign In
          </Button>
        </div>
      </section>

      {/* Quick Sign In Modal */}
      {showQuickSignIn && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="max-w-md w-full p-4">
            <CardHeader>
              <CardTitle>Quick Sign In</CardTitle>
              <CardDescription>
                Enter your email and password to quickly sign in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuickSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-green-200 focus:border-green-400 h-12 text-base pr-12"
                      placeholder="Enter your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <Button
                variant="link"
                onClick={() => setShowQuickSignIn(false)}
                className="mt-2"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Utensils className="h-10 w-10 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Meal Planning
              </h3>
              <p className="text-gray-600">
                Create and organize your weekly meal plans with ease.
              </p>
            </div>
            <div>
              <Menu className="h-10 w-10 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Pantry Management
              </h3>
              <p className="text-gray-600">
                Keep track of your ingredients and never let anything expire
                again.
              </p>
            </div>
            <div>
              <Menu className="h-10 w-10 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Shopping List
              </h3>
              <p className="text-gray-600">
                Generate smart shopping lists based on your meal plans and
                pantry inventory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                1. Create a Meal Plan
              </h3>
              <p className="text-gray-600">
                Start by creating a meal plan for the week, adding your
                favorite recipes.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                2. Manage Your Pantry
              </h3>
              <p className="text-gray-600">
                Add ingredients to your virtual pantry, noting expiration dates
                and quantities.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                3. Generate a Shopping List
              </h3>
              <p className="text-gray-600">
                Generate a shopping list based on your meal plan and pantry
                inventory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-500 to-orange-500 text-white text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Kitchen?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of families who are saving money, time, and the
            planet with smart meal planning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/signup")}
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              Start Free Trial
            </Button>
            <Button
              onClick={() => navigate("/pricing")}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-3"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-green-100 border-t border-green-200 text-center">
        <p className="text-gray-600">
          &copy; {new Date().getFullYear()} Pantry. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
