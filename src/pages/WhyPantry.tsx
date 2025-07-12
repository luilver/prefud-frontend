
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, ArrowLeft, Leaf, Clock, DollarSign, Users, TrendingDown, Recycle, ShoppingCart, Calendar, BarChart3, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WhyPantry = () => {
  const navigate = useNavigate();

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
          <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 via-orange-600 to-green-600 bg-clip-text text-transparent leading-tight">
              Why Pantry is
              <br />
              <span className="text-3xl md:text-5xl">Changing the World</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Every day, millions of tons of food are wasted while people struggle with meal planning and grocery shopping. 
              Pantry is revolutionizing how we think about food, sustainability, and smart living.
            </p>
          </div>

          {/* Impact Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-green-200 text-center">
              <CardContent className="p-4">
                <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">40%</div>
                <div className="text-sm text-gray-600">Food Waste Reduced</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-orange-200 text-center">
              <CardContent className="p-4">
                <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-2">$1,200</div>
                <div className="text-sm text-gray-600">Average Yearly Savings</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200 text-center">
              <CardContent className="p-4">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">6 hrs</div>
                <div className="text-sm text-gray-600">Weekly Time Saved</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 text-center">
              <CardContent className="p-4">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">2.3 tons</div>
                <div className="text-sm text-gray-600">CO₂ Reduced/Year</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Benefits Sections */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl space-y-20">
          
          {/* Food Waste Reduction */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <Recycle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-green-700">Eliminate Food Waste</h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Did you know that the average household throws away $1,500 worth of food every year? 
                Pantry's intelligent tracking system monitors expiration dates, suggests recipes based on what's about to expire, 
                and sends you timely alerts to use ingredients before they go bad.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Smart expiration date tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Recipe suggestions for expiring items</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Proactive waste prevention alerts</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-8 text-center">
              <img 
                src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&h=400&fit=crop&crop=center" 
                alt="Fresh fruits and vegetables" 
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="text-2xl font-bold text-green-700 mb-2">40% Less Waste</div>
              <div className="text-green-600">Average reduction in food waste per household</div>
            </div>
          </div>

          {/* Time Optimization */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-8 text-center order-2 md:order-1">
              <img 
                src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=500&h=400&fit=crop&crop=center" 
                alt="Modern kitchen with organized pantry" 
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="text-2xl font-bold text-blue-700 mb-2">6 Hours Saved</div>
              <div className="text-blue-600">Every week on meal planning and shopping</div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-blue-700">Optimize Your Time</h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Stop spending hours planning meals and making multiple grocery trips. Pantry's AI creates personalized 
                meal plans based on your preferences, generates smart shopping lists, and even tracks your pantry inventory 
                automatically. More time for what matters most.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">AI-powered meal planning in minutes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Automated shopping list generation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Smart grocery trip optimization</span>
                </div>
              </div>
            </div>
          </div>

          {/* Money Savings */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-orange-100 rounded-full mr-4">
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-orange-700">Save Serious Money</h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our users save an average of $1,200 per year by reducing food waste, buying only what they need, 
                and taking advantage of Pantry's smart shopping features. The app pays for itself in the first month!
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="font-bold text-orange-700">$100/month</div>
                    <div className="text-sm text-orange-600">Average savings</div>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <div className="font-bold text-orange-700">30% Less</div>
                    <div className="text-sm text-orange-600">Grocery spending</div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-700 mb-2">$1,200</div>
                  <div className="text-orange-600">Average yearly savings per household</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-orange-700">$600</div>
                    <div className="text-orange-600">Reduced food waste</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-orange-700">$400</div>
                    <div className="text-orange-600">Smart shopping</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-orange-700">$150</div>
                    <div className="text-orange-600">Bulk buying alerts</div>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-orange-700">$50</div>
                    <div className="text-orange-600">Coupon integration</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carbon Footprint */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-8 text-center order-2 md:order-1">
              <Leaf className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <div className="text-2xl font-bold text-purple-700 mb-2">2.3 Tons CO₂</div>
              <div className="text-purple-600 mb-4">Reduced per household annually</div>
              <div className="text-sm text-purple-600 leading-relaxed">
                Equivalent to taking a car off the road for 5,800 miles or planting 105 trees
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-100 rounded-full mr-4">
                  <Leaf className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-purple-700">Reduce Carbon Footprint</h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Food waste is responsible for 8% of global greenhouse gas emissions. By using Pantry, you're not just 
                saving money - you're helping save the planet. Every meal planned efficiently and every ingredient saved 
                from the trash makes a real environmental impact.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Reduce methane from food waste</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Lower transportation emissions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Support sustainable food systems</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            How Pantry Makes It All Possible
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-green-200 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <ShoppingCart className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle className="text-green-700">Smart Shopping Lists</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Automatically generated based on your meal plans, pantry inventory, and store layouts. 
                  Never forget an ingredient or buy duplicates again.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-blue-200 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <Calendar className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle className="text-blue-700">AI Meal Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Personalized meal suggestions based on your preferences, dietary restrictions, 
                  and what's already in your pantry.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-orange-600 mb-4" />
                <CardTitle className="text-orange-700">Waste Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track your progress with detailed analytics on food waste reduction, 
                  money saved, and environmental impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-orange-600">
        <div className="container mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the Food Revolution Today
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Start saving money, time, and the planet with Pantry's intelligent kitchen management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-3"
              onClick={() => navigate('/signup')}
            >
              Get Started Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600 font-semibold px-8 py-3"
              onClick={() => navigate('/')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyPantry;
