import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus, CreditCard, ArrowLeft, Check, Crown } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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

interface SubscriptionPurchaseProps {
  onBack: () => void;
}

const SubscriptionPurchase = ({ onBack }: SubscriptionPurchaseProps) => {
  const { paymentMethods, getPaymentMethods, createCheckoutWithPaymentMethod, acceptSubscription } = useUser();
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // Convert API subscription types to UI subscription plans
  const convertApiToPlans = (apiPlans: ApiSubscriptionType[]): SubscriptionPlan[] => {
    return apiPlans.filter(plan => plan.price > 0).map((apiPlan) => {
      const priceInDollars = apiPlan.price / 100; // Convert cents to dollars
      
      const features = [
        `${apiPlan.mealPlans} Meal Plans per month`,
        `${apiPlan.generatedMeals} Meal Creations with pantry ingredients`,
        `${apiPlan.healthyDrinks} Healthy Drinks per month`,
        `${apiPlan.specialMeals} Special Meals per month`
      ];

      if (apiPlan.name.toLowerCase() === 'family') {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingPlans(true);
        const [apiPlans] = await Promise.all([
          getAllSubscriptionTypes(),
          getPaymentMethods()
        ]);
        
        const convertedPlans = convertApiToPlans(apiPlans);
        setPlans(convertedPlans);
        
        // Set default to family plan if available
        const familyPlan = convertedPlans.find(plan => plan.name.toLowerCase() === 'family');
        if (familyPlan) {
          setSelectedPlan(familyPlan);
        } else if (convertedPlans.length > 0) {
          setSelectedPlan(convertedPlans[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error Loading Data",
          description: "Failed to load subscription plans and payment methods.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchData();
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

  if (showAddPaymentMethod && selectedPlan) {
    return (
      <PaymentForm
        onSuccess={handleAddPaymentMethodSuccess}
        onBack={() => setShowAddPaymentMethod(false)}
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

  if (isLoadingPlans) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Choose Your Plan</h2>
            <p className="text-gray-600">Loading subscription plans...</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
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
              selectedPlan?.id === plan.id
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
            
            {selectedPlan?.id === plan.id && (
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
      {selectedPlan && (
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
      )}
    </div>
  );
};

export default SubscriptionPurchase;
