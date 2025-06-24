
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, Star, Users, Shield, Zap, Heart } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import Dashboard from "@/components/Dashboard";
import SignupForm from "@/components/SignupForm";
import PasswordRecovery from "@/components/PasswordRecovery";

const Index = () => {
  const userContext = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Add safety check for context
  if (!userContext) {
    console.error('Index component not wrapped in UserProvider');
    return <div>Loading...</div>;
  }

  const { isAuthenticated, login } = userContext;

  // Listen for logout events and reset state
  useEffect(() => {
    const handleLogout = () => {
      console.log('Logout event received, resetting UI state');
      setShowSignup(false);
      setShowPasswordRecovery(false);
      setEmail("");
      setPassword("");
    };

    window.addEventListener('user-logout', handleLogout);
    return () => window.removeEventListener('user-logout', handleLogout);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Dashboard />;
  }

  if (showPasswordRecovery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-green-100">
        <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
                Pantry
              </h1>
            </div>
          </div>
        </header>

        <section className="py-20 px-4">
          <div className="container mx-auto">
            <PasswordRecovery onBack={() => setShowPasswordRecovery(false)} />
          </div>
        </section>
      </div>
    );
  }

  if (showSignup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-green-100">
        <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
                Pantry
              </h1>
            </div>
            <Button variant="ghost" onClick={() => setShowSignup(false)}>
              Back to Login
            </Button>
          </div>
        </header>

        <section className="py-20 px-4">
          <div className="container mx-auto">
            <SignupForm />
          </div>
        </section>
      </div>
    );
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
              Pantry
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
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200 mb-6">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Trusted by 10,000+ home chefs</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 via-orange-600 to-green-600 bg-clip-text text-transparent leading-tight">
              Your Smart Kitchen
              <br />
              <span className="text-4xl md:text-6xl">Companion</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Transform your kitchen experience with AI-powered meal planning, smart pantry management, 
              and personalized nutrition tracking. Cook smarter, waste less, live healthier.
            </p>
          </div>
          
          {/* Value Propositions */}
          <div className="grid md:grid-cols-3 gap-8 my-16 max-w-6xl mx-auto">
            <Card className="bg-white/70 backdrop-blur-sm border-green-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-green-700 text-xl">AI-Powered Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Get personalized meal suggestions based on your pantry items, dietary preferences, and expiration dates. 
                  Never wonder "what's for dinner?" again.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-orange-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-orange-700 text-xl">Zero Food Waste</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Track expiration dates, get timely alerts, and receive recipes that prioritize ingredients 
                  about to expire. Save money and help the planet.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-green-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-green-700 text-xl">Health & Nutrition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  Track calories, nutrients, and dietary goals effortlessly. Make informed choices 
                  with detailed nutritional insights for every meal.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Social Proof */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="text-lg font-semibold">10,000+</span>
                <span className="text-gray-600">Active Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span className="text-lg font-semibold">4.9/5</span>
                <span className="text-gray-600">User Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-lg font-semibold">50M+</span>
                <span className="text-gray-600">Meals Planned</span>
              </div>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border-green-200 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center text-green-700 text-2xl">Start Your Journey</CardTitle>
              <CardDescription className="text-center text-lg">
                Join thousands creating healthier meal habits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="text-base">Login</TabsTrigger>
                  <TabsTrigger value="signup" onClick={() => setShowSignup(true)} className="text-base">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-base">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-green-200 focus:border-green-400 h-12 text-base"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-base">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-green-200 focus:border-green-400 h-12 text-base"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="text-right">
                      <Button 
                        type="button"
                        variant="link" 
                        className="text-green-600 hover:text-green-700 p-0"
                        onClick={() => setShowPasswordRecovery(true)}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <div className="text-center space-y-4">
                    <p className="text-gray-600 text-base">Create your account with personalized plan selection</p>
                    <Button 
                      onClick={() => setShowSignup(true)}
                      className="w-full h-12 text-base bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                    >
                      Create Free Account
                    </Button>
                  </div>
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
