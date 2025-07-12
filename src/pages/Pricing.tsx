
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star, Leaf, Clock, DollarSign, ArrowLeft, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
  maxMealPlans: number;
  maxMealCreations: number;
  freeDeliveries: number;
  homeDeliveries?: number;
}

const plans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    maxMealPlans: 1,
    maxMealCreations: 3,
    freeDeliveries: 0,
    features: [
      "1 Meal Plan per month",
      "3 Meal creations with pantry ingredients",
      "Basic Recipe Collection",
      "Shopping List Generator",
      "Email Support"
    ]
  },
  {
    id: "family",
    name: "Family",
    price: 40,
    interval: "month",
    popular: true,
    maxMealPlans: 5,
    maxMealCreations: 10,
    freeDeliveries: 3,
    features: [
      "5 Meal Plans per month",
      "10 Meal creations with pantry ingredients",
      "AI Meal Recommendations",
      "Advanced Recipe Collection",
      "3 Free grocery deliveries",
      "Family Meal Planning",
      "Nutritional Analysis",
      "Priority Support"
    ]
  },
  {
    id: "professional",
    name: "Professional",
    price: 120,
    interval: "month",
    maxMealPlans: 12,
    maxMealCreations: 999,
    freeDeliveries: 10,
    homeDeliveries: 3,
    features: [
      "12 Meal Plans per month",
      "Unlimited meal creations",
      "10 Free grocery deliveries",
      "3 Free home deliveries",
      "Advanced AI Meal Planning",
      "Custom Dietary Plans",
      "Bulk Shopping Lists",
      "Business Features",
      "Phone Support",
      "Priority Processing"
    ]
  }
];

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("family");

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // Navigate to signup or login based on user state
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-green-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
              Pantry
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
            <Button variant="outline" onClick={() => navigate('/signin')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/signup')} className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Join thousands of families saving money, time, and the environment with smart meal planning
          </p>

          {/* Impact Stats */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">40% Less Food Waste</h3>
              <p className="text-gray-600">Reduce your carbon footprint by planning meals with ingredients you already have</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-orange-200">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Save $200/Month</h3>
              <p className="text-gray-600">Average family saves money by reducing food waste and optimizing grocery shopping</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">5 Hours/Week</h3>
              <p className="text-gray-600">Time saved on meal planning, grocery shopping, and food preparation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative ${
                  plan.popular 
                    ? 'border-green-500 border-2 bg-gradient-to-b from-green-50 to-white scale-105' 
                    : 'border-gray-200 bg-white/80 backdrop-blur-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <Crown className={`h-8 w-8 ${plan.popular ? 'text-green-500' : 'text-gray-400'}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <div className="text-4xl font-bold text-gray-800 mt-4">
                      ${plan.price}
                      <span className="text-lg font-normal text-gray-600">/{plan.interval}</span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-3">Plan Limits</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• {plan.maxMealPlans} meal plans per month</li>
                      <li>• {plan.maxMealCreations === 999 ? 'Unlimited' : plan.maxMealCreations} meal creations</li>
                      <li>• {plan.freeDeliveries} free grocery deliveries</li>
                      {plan.homeDeliveries && <li>• {plan.homeDeliveries} free home deliveries</li>}
                    </ul>
                  </div>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {plan.price === 0 ? 'Start Free' : `Choose ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Environmental Impact */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Together We're Making a Difference
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-green-100">Families Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2M lbs</div>
              <div className="text-green-100">Food Waste Prevented</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$10M</div>
              <div className="text-green-100">Money Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100K tons</div>
              <div className="text-green-100">CO2 Emissions Reduced</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-600">Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at your next billing cycle.</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">What happens to unused meal plans?</h3>
              <p className="text-gray-600">Unused meal plans don't roll over to the next month, but you can always downgrade if you're not using your full allocation.</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">How do the free deliveries work?</h3>
              <p className="text-gray-600">We partner with local grocery stores and delivery services to offer free delivery credits that are automatically applied to your orders.</p>
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
            Join thousands of families who are saving money, time, and the planet with Pantry
          </p>
          <Button 
            onClick={() => navigate('/signup')}
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
