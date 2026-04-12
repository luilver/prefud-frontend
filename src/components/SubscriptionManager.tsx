import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Star, XCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAllSubscriptionTypes, ApiSubscriptionType, subscribeUser } from "@/services/payments";
import PaymentForm from "./PaymentForm";
import SubscriptionCancelModal from "./SubscriptionCancelModal";
import PaymentMethodModal from "./PaymentMethodModal";
import SubscriptionSuccessModal from "./SubscriptionSuccessModal";
import { trackEvent } from "@/services/analytics";
import {
  isNativePlatform,
  getOfferings,
  purchasePackage,
  restorePurchases,
  getRevenueCatProductId,
  getBackendSubscriptionTypeId,
} from "@/services/revenueCatService";
import type { PurchasesPackage } from "@revenuecat/purchases-capacitor";

// Hide entire component on native platforms (iOS/Android)
const isNative = isNativePlatform();

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
  const [currentSubscriptionId, setCurrentSubscriptionId] = useState<string>("");
  const [currentSubscriptionName, setCurrentSubscriptionName] = useState<string>("Free");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isNativePurchasing, setIsNativePurchasing] = useState(false);
  const [rcPackages, setRcPackages] = useState<PurchasesPackage[]>([]);
  const { toast } = useToast();
  const { user, updateSubscription } = useAuth();
  const isNative = isNativePlatform();

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
        console.log('this are the subscription plans ', apiPlans);
        const convertedPlans = convertApiToPlans(apiPlans);
        setPlans(convertedPlans);

        // Set current subscription ID for comparison
        const userSubId = (user?.subscription?.subscriptionTypeId ?? "").toString().trim();
        console.log("[SubscriptionManager] User subscription ID:", userSubId);
        setCurrentSubscriptionId(userSubId);

        // Also set the current subscription name based on the loaded plans
        const matched = convertedPlans.find(p => p.id === userSubId);
        setCurrentSubscriptionName(matched ? matched.name : "Free");

        // Fetch RevenueCat offerings on native
        if (isNative) {
          const packages = await getOfferings();
  
          setRcPackages(packages);
          console.log("[SubscriptionManager] RevenueCat packages:", packages);
        }
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
  }, [toast, user?.subscription?.subscriptionTypeId, isNative]);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan.id === currentSubscriptionId) return;
    console.log('selected plan during selection ', plan)
    setSelectedPlan(plan);
    if (plan.price === 0) {
      // Free plan - show confirmation modal if user has an active subscription
      if (currentSubscriptionId && currentSubscriptionId !== "") {
        setShowCancelModal(true);
      } else {
        handleSubscriptionSuccess();
      }
    } else if (isNative) {
      // Native platform → use RevenueCat IAP
      console.log('native behavior!!!')
      await handleNativePurchase(plan);
    } else {
      // Web → use Stripe payment modal
      setShowPaymentModal(true);
    }
  };

  /**
   * Handle native in-app purchase via RevenueCat
   */
  const handleNativePurchase = async (plan: SubscriptionPlan) => {
    console.log('handle native log plan selected', plan)
    const rcProductId = getRevenueCatProductId(plan.id);
    console.log('rcPRODUCTID ', rcProductId);
    if (!rcProductId) {
      toast({
        title: "Error",
        description: "This plan is not available for in-app purchase.",
        variant: "destructive",
      });
      return;
    }

    // Find matching RC package
    const matchingPackage = rcPackages.find(
      (pkg) => pkg.product.identifier === rcProductId
    );

    if (!matchingPackage) {
      toast({
        title: "Product Not Found",
        description: "This subscription product is not available yet. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsNativePurchasing(true);
    trackEvent('button_click', {
      button_name: 'native_iap_purchase',
      screen: 'subscription_manager',
      plan_name: plan.name,
    });

    try {
      const result = await purchasePackage(matchingPackage);
      
      if (result.success) {
        // Persist subscription in your backend
        const backendResult = await subscribeUser(
          user?.userId || "",
          plan.id,
          `rc_${matchingPackage.product.identifier}`
        );
        
        updateSubscription(backendResult.return);
        setCurrentSubscriptionId(plan.id);
        setCurrentSubscriptionName(plan.name);
        setShowSuccessModal(true);

        toast({
          title: "Subscription Successful!",
          description: `Welcome to ${plan.name}! Your subscription is now active.`,
        });
      } else if (result.error === 'cancelled') {
        // User cancelled — do nothing
      } else {
        toast({
          title: "Purchase Failed",
          description: result.error || "There was an error processing your purchase.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('[SubscriptionManager] Native purchase error:', error);
      toast({
        title: "Purchase Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsNativePurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    const result = await restorePurchases();
    if (result.success) {
      toast({
        title: "Purchases Restored",
        description: "Your previous purchases have been restored.",
      });
    } else {
      toast({
        title: "Restore Failed",
        description: result.error || "Could not restore purchases.",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = () => {
    trackEvent('button_click', {
          button_name: 'cancel_subscription_submit',
          screen: 'profile_page',
        })
    // Simulate switching to free plan
    setCurrentSubscriptionId("");
    setCurrentSubscriptionName("Free");
    setShowCancelModal(false);
  };

  const handleSubscriptionSuccess = () => {
    if (selectedPlan) {
      setCurrentSubscriptionId(selectedPlan.id);
      setCurrentSubscriptionName(selectedPlan.name);
      setShowPaymentModal(false);
      setShowSuccessModal(true);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    handleSubscriptionSuccess();
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
        <h1 className="text-3xl font-bold text-gray-800">Actual Plan</h1>
        
        
        {/* Current Subscription Display */}
        {currentSubscriptionName !== "Free" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Current: {currentSubscriptionName} Plan
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-800">Update your plan</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your meal planning needs. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {plans.map((plan) => {
          // Mark current plan ONLY when IDs match.
          // If the user has no subscription ID, mark Free (price === 0) as current.
          const isCurrentPlan = plan.id === currentSubscriptionId || (!currentSubscriptionId && plan.price === 0);
          
          return (
            <Card 
              key={plan.id}
              className={`relative ${
                plan.popular 
                  ? 'border-green-500 border-2 bg-gradient-to-b from-green-50 to-white' 
                  : 'border-gray-200'
              } ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Current Plan
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
                  disabled={isCurrentPlan || isNativePurchasing}
                >
                  {isNativePurchasing && selectedPlan?.id === plan.id
                    ? 'Processing...'
                    : isCurrentPlan ? 'Current Plan' : `Get ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Restore Purchases button for native platforms */}
      {isNative && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={handleRestorePurchases}
            className="mx-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restore Purchases
          </Button>
        </div>
      )}

      <div className="text-center space-y-4 pt-8 border-t">
        <h3 className="text-lg font-semibold text-gray-800">All plans include:</h3>
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <Check className="h-4 w-4 text-emerald-500" />
            <span className="font-medium">Cancel anytime</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <Check className="h-4 w-4 text-emerald-500" />
            <span className="font-medium">Secure payment processing</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SubscriptionCancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        currentPlan={currentSubscriptionName}
        userId={user?.userId || ""}
      />

      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handleSubscriptionSuccess}
        rukuClientId={user?.profile?.ruku_client_id || ""}
        userId={user?.userId || ""}
        selectedPlan={selectedPlan || { id: "", name: "", price: 0 }}
      />

      <SubscriptionSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        planName={selectedPlan?.name || ""}
        planPrice={selectedPlan?.price || 0}
      />

     
    </div>
  );
};

export default SubscriptionManager;
