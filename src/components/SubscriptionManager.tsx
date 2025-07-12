
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

const plans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    features: [
      "1 Meal Plan per month",
      "3 Meal Creations with pantry ingredients",
      "Basic Recipe Collection",
      "Shopping List Generator",
      "Email Support"
    ],
    limits: {
      plansPerMonth: 1,
      mealCreations: 3,
      deliveryCommissions: 0
    }
  },
  {
    id: "family",
    name: "Family",
    price: 40,
    interval: "month",
    popular: true,
    features: [
      "5 Meal Plans per month",
      "10 Meal Creations with pantry ingredients",
      "AI Meal Recommendations",
      "Advanced Recipe Collection",
      "3 Free Delivery Commissions",
      "Nutritional Analysis",
      "Priority Support"
    ],
    limits: {
      plansPerMonth: 5,
      mealCreations: 10,
      deliveryCommissions: 3
    }
  },
  {
    id: "professional",
    name: "Professional",
    price: 120,
    interval: "month",
    features: [
      "12 Meal Plans per month",
      "Unlimited Meal Creations",
      "10 Free Delivery Commissions",
      "3 Free Home Deliveries",
      "Advanced AI Recommendations",
      "Custom Dietary Plans",
      "Professional Analytics",
      "Phone Support"
    ],
    limits: {
      plansPerMonth: 12,
      mealCreations: -1, // unlimited
      deliveryCommissions: 10,
      homeDeliveries: 3
    }
  }
];

const SubscriptionManager = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { toast } = useToast();

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
          email: "user@example.com", // This would come from user context
          phone: "+1234567890"
        }}
        selectedPlan={selectedPlan}
      />
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
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-600">/{plan.interval}</span>
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
              >
                Get {plan.name}
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
