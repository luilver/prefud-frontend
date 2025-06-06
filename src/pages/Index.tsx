
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils } from "lucide-react";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in real app this would integrate with Supabase
    setIsLoggedIn(true);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock signup - in real app this would integrate with Supabase
    setIsLoggedIn(true);
  };

  if (isLoggedIn) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-green-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
              MealCraft
            </h1>
          </div>
          <div className="flex space-x-4">
            <Button variant="ghost" className="text-green-700 hover:text-green-800">
              Features
            </Button>
            <Button variant="ghost" className="text-green-700 hover:text-green-800">
              Pricing
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 via-orange-600 to-green-600 bg-clip-text text-transparent">
            Your Personal Meal Planning Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plan your meals, track calories, manage ingredients, and get AI-powered recipe recommendations. 
            Everything you need for a healthier lifestyle in one beautiful app.
          </p>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 my-16 max-w-4xl mx-auto">
            <Card className="bg-white/70 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-green-700">🥗 Smart Meal Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">AI-powered meal suggestions based on your dietary preferences and calorie goals.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-orange-700">📊 Calorie Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Track nutrition and calories for every meal with our comprehensive food database.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-green-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-green-700">🛒 Smart Shopping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Generate grocery lists and order directly from Walmart, Smith's, and more.</p>
              </CardContent>
            </Card>
          </div>

          {/* Auth Card */}
          <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-green-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-green-700">Get Started Today</CardTitle>
              <CardDescription className="text-center">
                Join thousands of users planning healthier meals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600">
                      Login
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600">
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
