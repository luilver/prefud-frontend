import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus, CreditCard, ArrowLeft, Check, Crown } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
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

interface SubscriptionPurchaseProps {
  onBack: () => void;
}

const SubscriptionPurchase = ({ onBack }: SubscriptionPurchaseProps) => {
  const { paymentMethods, getPaymentMethods, createCheckoutWithPaymentMethod, acceptSubscription } = useUser();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(plans[0]); // Default to family
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getPaymentMethods();
  }, []);

  useEffect(() => {
    // Set default payment method as selected
    const defaultMethod = paymentMethods.find(method => method.isDefault);
    if (defaultMethod && !selectedPaymentMethod) {
      setSelectedPaymentMethod(defaultMethod.id);
    }
  }, [paymentMethods, selectedPaymentMethod]);

  const handlePurchaseSubscription = async () => {
    if (!selectedPaymentMethod && !showAddPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method or add a new one.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (selectedPaymentMethod) {
        // Use existing payment method
        const checkoutUrl = await createCheckoutWithPaymentMethod(selectedPlan, selectedPaymentMethod);
        window.open(checkoutUrl, '_blank');
        
        // Simulate successful subscription
        await acceptSubscription(selectedPlan.id);
        
        toast({
          title: "Subscription Activated!",
          description: `Welcome to ${selectedPlan.name}! Your subscription is now active.`,
        });
        
        onBack();
      }
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaymentMethodSuccess = async (paymentData: any) => {
    // Refresh payment methods
    await getPaymentMethods();
    setShowAddPaymentMethod(false);
    
    // Proceed with subscription using the new payment method
    toast({
      title: "Payment Method Added",
      description: "Your payment method has been added successfully.",
    });
  };

  if (showAddPaymentMethod) {
    return (
      <PaymentForm
        onSuccess={handleAddPaymentMethodSuccess}
        onBack={() => setShowAddPaymentMethod(false)}
        userInfo={{
          email: "user@example.com",
          phone: "+1234567890"
        }}
        selectedPlan={selectedPlan}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Choose Your Plan</h2>
          <p className="text-gray-600">Select a plan and payment method to get started</p>
        </div>
      </div>

      {/* Plan Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative cursor-pointer transition-all ${
              selectedPlan.id === plan.id
                ? 'border-green-500 border-2 bg-gradient-to-b from-green-50 to-white'
                : plan.popular
                ? 'border-green-500 border-2 bg-gradient-to-b from-green-50 to-white'
                : 'border-gray-200 hover:border-green-300'
            }`}
            onClick={() => setSelectedPlan(plan)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Crown className="h-3 w-3" />
                  <span>Most Popular</span>
                </div>
              </div>
            )}
            
            <CardHeader className="text-center">
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
            </CardContent>
            
            {selectedPlan.id === plan.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            <span>Payment Method</span>
          </CardTitle>
          <CardDescription>
            Choose a payment method for your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.length > 0 ? (
              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium capitalize">{method.brand}</span>
                              <span>•••• {method.last4}</span>
                              {method.isDefault && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No payment methods found</p>
                <p className="text-sm">Add a payment method to continue</p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setShowAddPaymentMethod(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Button */}
      <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-semibold text-gray-800">{selectedPlan.name} Plan</h3>
          <p className="text-2xl font-bold text-green-600">
            ${selectedPlan.price}/{selectedPlan.interval}
          </p>
        </div>
        <Button 
          onClick={handlePurchaseSubscription}
          disabled={isLoading || (!selectedPaymentMethod && paymentMethods.length > 0)}
          className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
        >
          {isLoading ? 'Processing...' : 'Subscribe Now'}
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionPurchase;
