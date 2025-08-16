
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAllSubscriptionTypes, ApiSubscriptionType } from "@/services/payments";
import PaymentForm from "./PaymentForm";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  limits: {
    plansPerMonth: number;
    mealCreations: number;
    deliveryCommissions: number;
    homeDeliveries?: number;
  };
  popular?: boolean;
}

const SubscriptionManager = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Convert API subscription types to UI subscription plans
  const convertApiToPlans = (apiPlans: ApiSubscriptionType[]): SubscriptionPlan[] => {
    return apiPlans.map((apiPlan) => {
      const priceInDollars = apiPlan.price / 100; // Convert cents to dollars
      
      // Generate features based on the plan data
      const features = [
        `${apiPlan.mealPlans} Meal Plans per month`,
        `${apiPlan.generatedMeals} Meal Creations with pantry ingredients`,
        `${apiPlan.healthyDrinks} Healthy Drinks per month`,
        `${apiPlan.specialMeals} Special Meals per month`
      ];

      // Add additional features based on plan type
      if (apiPlan.name.toLowerCase() === 'free') {
        features.push("Basic Recipe Collection", "Shopping List Generator", "Email Support");
      } else if (apiPlan.name.toLowerCase() === 'family') {
        features.push(
          "AI Meal Recommendations",
          "Advanced Recipe Collection", 
          "3 Free Delivery Commissions",
          "Nutritional Analysis",
          "Priority Support"
        );
      } else if (apiPlan.name.toLowerCase() === 'professional') {
        features.push(
          "10 Free Delivery Commissions",
          "3 Free Home Deliveries",
          "Advanced AI Recommendations", 
          "Custom Dietary Plans",
          "Professional Analytics",
          "Phone Support"
        );
      }

      return {
        id: apiPlan._id,
        name: apiPlan.name,
        price: priceInDollars,
        interval: "month",
        features,
        limits: {
          plansPerMonth: apiPlan.mealPlans,
          mealCreations: apiPlan.generatedMeals,
          deliveryCommissions: apiPlan.name.toLowerCase() === 'family' ? 3 : 
                              apiPlan.name.toLowerCase() === 'professional' ? 10 : 0,
          homeDeliveries: apiPlan.name.toLowerCase() === 'professional' ? 3 : undefined
        },
        popular: apiPlan.name.toLowerCase() === 'family'
      };
    });
  };

  // Fetch subscription types on component mount
  useEffect(() => {
    const fetchSubscriptionTypes = async () => {
      try {
        setIsLoading(true);
        const apiPlans = await getAllSubscriptionTypes();
        const convertedPlans = convertApiToPlans(apiPlans);
        setPlans(convertedPlans);
      } catch (error) {
        console.error('Error fetching subscription types:', error);
        toast({
          title: "Error Loading Plans",
          description: "Failed to load subscription plans. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionTypes();
  }, [toast]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    toast({
      title: "Subscription Activated!",
      description: `Welcome to ${selectedPlan?.name}! Your subscription is now active.`,
    });
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  const handlePaymentBack = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  if (showPaymentForm && selectedPlan) {
    return (
      <PaymentForm
        onSuccess={handlePaymentSuccess}
        onBack={handlePaymentBack}
        userInfo={{
          email: user?.email || "user@example.com",
          phone: user?.profile?.phone || "+1234567890",
          customerId: user?.profile?.ruku_client_id || "",
          userId: user?.userId || ""
        }}
        selectedPlan={selectedPlan}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">Choose Your Plan</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Loading subscription plans...
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">Choose Your Plan</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your meal planning needs. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative ${
              plan.popular 
                ? 'border-green-500 border-2 bg-gradient-to-b from-green-50 to-white' 
                : 'border-gray-200'
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
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Crown className={`h-8 w-8 ${plan.popular ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>
                <div className="text-3xl font-bold text-gray-800 mt-2">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  {plan.price > 0 && <span className="text-sm font-normal text-gray-600">/{plan.interval}</span>}
                </div>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                disabled={plan.price === 0}
              >
                {plan.price === 0 ? 'Current Plan' : `Get ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4 pt-8 border-t">
        <h3 className="text-lg font-semibold text-gray-800">All plans include:</h3>
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-green-500" />
            <span>30-day money-back guarantee</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-green-500" />
            <span>Secure payment processing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
