import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Check, X, User, Mail, CreditCard, Eye, EyeOff, Star } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import UserProfileForm from "./UserProfileForm";
import OTPVerification from "./OTPVerification";
import PaymentForm from "./PaymentForm";
import WelcomeModal from "./WelcomeModal";

interface SignupData {
  email: string;
  password: string;
  wantsSubscription: boolean;
  selectedPlan?: string;
  profile?: {
    name: string;
    lastName: string;
    phonePrefix: string;
    phone: string;
    weight: number;
    heightFeet: number;
    heightInches: number;
    birthday: string;
    healthGoals: string[];
    dietTypes: string[];
    allergies: string[];
  };
}

const SignupSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [signupData, setSignupData] = useState<SignupData>({
    email: "",
    password: "",
    wantsSubscription: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useUser();
  const { t } = useLanguage();

  // Updated subscription plans to match pricing page
  const subscriptionPlans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      interval: "month",
      description: "Perfect for getting started with meal planning",
      features: [
        "1 Meal Plan per month",
        "Basic Recipe Collection",
        "Shopping List Generator",
        "Pantry Management",
        "Email Support"
      ],
      popular: false
    },
    {
      id: "family",
      name: "Family", 
      price: 40,
      interval: "month",
      description: "Ideal for families looking to optimize meal planning",
      features: [
        "5 Meal Plans per month",
        "10 Meal Creations with pantry ingredients",
        "AI Meal Recommendations",
        "Advanced Recipe Collection",
        "3 Free Delivery Commissions",
        "Nutritional Analysis",
        "Priority Support"
      ],
      popular: true
    },
    {
      id: "professional",
      name: "Professional",
      price: 120,
      interval: "month",
      description: "For meal planning professionals and large households",
      features: [
        "12 Meal Plans per month",
        "Unlimited Meal Creations",
        "10 Free Delivery Commissions",
        "3 Free Home Deliveries",
        "Advanced AI Recommendations",
        "Custom Dietary Plans",
        "Bulk Shopping Lists",
        "Professional Analytics",
        "Phone Support",
        "Priority Processing"
      ],
      popular: false
    }
  ];

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Mock: Sending OTP to:', signupData.email);
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep(2);
    } catch (error) {
      console.error('Failed to send OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = () => {
    console.log('Mock: OTP verified successfully');
    setCurrentStep(3);
  };

  const handleProfileComplete = (profileData: any) => {
    console.log('Mock: Profile data saved:', profileData);
    setSignupData(prev => ({ ...prev, profile: profileData }));
    setCurrentStep(4);
  };

  const handleSubscriptionChoice = (planId: string) => {
    console.log('Mock: Subscription choice:', planId);
    const selectedPlan = subscriptionPlans.find(plan => plan.id === planId);
    setSignupData(prev => ({ 
      ...prev, 
      wantsSubscription: planId !== 'free',
      selectedPlan: planId
    }));
    
    if (planId === 'free') {
      completeSignup();
    } else {
      setCurrentStep(5);
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    console.log('Mock: Payment processed:', paymentData);
    completeSignup();
  };

  const completeSignup = async () => {
    try {
      console.log('Mock: Completing signup with data:', signupData);
      
      const userData = {
        name: signupData.profile?.name || signupData.email.split('@')[0],
        email: signupData.email,
        phone: signupData.profile?.phone || '',
        preferences: signupData.profile ? {
          dietaryRestrictions: [],
          allergies: signupData.profile.allergies || [],
          cuisinePreferences: [],
          cookingSkillLevel: 'beginner' as const,
          mealPrepTime: 30,
          budgetRange: 'medium' as const
        } : undefined
      };
      
      await signup(userData);
      
      console.log('Mock: Signup completed, showing welcome modal');
      
      setTimeout(() => {
        setShowWelcome(true);
      }, 100);
    } catch (error) {
      console.error('Mock: Signup failed:', error);
    }
  };

  const handleWelcomeClose = () => {
    console.log('Mock: Welcome modal closed, user should now see dashboard');
    setShowWelcome(false);
  };

  const stepItems = [
    { step: 1, title: "Basic Info", icon: User },
    { step: 2, title: "Verify Email", icon: Mail },
    { step: 3, title: "Profile", icon: User },
    { step: 4, title: "Subscription", icon: Crown },
    { step: 5, title: "Payment", icon: CreditCard },
  ];

  if (showWelcome) {
    return <WelcomeModal onClose={handleWelcomeClose} />;
  }

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Progress Steps - Mobile Responsive */}
      <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto">
        <div className="flex items-center space-x-2 sm:space-x-4 px-4 sm:px-0 min-w-max">
          {stepItems.map(({ step, title, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                currentStep >= step 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                {currentStep > step ? (
                  <Check className="h-3 w-3 sm:h-5 sm:w-5" />
                ) : (
                  <Icon className="h-3 w-3 sm:h-5 sm:w-5" />
                )}
              </div>
              <span className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium ${
                currentStep >= step ? 'text-green-600' : 'text-gray-400'
              }`}>
                {title}
              </span>
              {step < stepItems.length && (
                <div className={`w-4 sm:w-8 h-0.5 ml-2 sm:ml-4 ${
                  currentStep > step ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Basic Info - Now with translations */}
      {currentStep === 1 && (
        <Card className="max-w-full sm:max-w-md mx-auto bg-white/90 backdrop-blur-sm">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">{t('signup.account.title')}</CardTitle>
            <CardDescription className="text-sm sm:text-base">{t('signup.account.description')}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form onSubmit={handleBasicInfoSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm sm:text-base">{t('signup.account.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm sm:text-base">{t('signup.account.password')}</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="border-green-200 focus:border-green-400 h-10 sm:h-12 text-sm sm:text-base pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 h-10 sm:h-12 text-sm sm:text-base"
                disabled={isLoading}
              >
                {isLoading ? t('signup.account.sending') : t('signup.account.continue')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: OTP Verification */}
      {currentStep === 2 && (
        <OTPVerification 
          email={signupData.email}
          onVerified={handleOTPVerified}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {/* Step 3: User Profile - Now includes phone fields and name fields */}
      {currentStep === 3 && (
        <UserProfileForm 
          onComplete={handleProfileComplete}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {/* Step 4: Subscription Choice - Updated layout and pricing */}
      {currentStep === 4 && (
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center mb-6 sm:mb-8 px-4 sm:px-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Choose Your Plan</h2>
            <p className="text-gray-600 text-sm sm:text-base">Select the plan that works best for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 px-2 sm:px-0">
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative border-2 cursor-pointer transition-all h-full ${
                  plan.popular 
                    ? 'border-green-500 ring-2 ring-green-200 shadow-lg' 
                    : 'border-gray-200 hover:border-green-500 hover:shadow-md'
                }`}
                onClick={() => handleSubscriptionChoice(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4 px-4 sm:px-6 py-4 sm:py-6">
                  <div className="flex justify-center mb-4">
                    <Crown className={`h-8 w-8 ${plan.popular ? 'text-green-500' : 'text-gray-400'}`} />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-sm mb-4 min-h-[3rem] flex items-center justify-center">
                    {plan.description}
                  </CardDescription>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    {plan.price > 0 && <span className="text-sm font-normal text-gray-600">/{plan.interval}</span>}
                  </div>
                </CardHeader>

                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col justify-between flex-1">
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Features</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    className={`w-full h-12 text-sm sm:text-base font-medium ${
                      plan.id === 'free' 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                        : plan.id === 'family'
                        ? 'bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                  >
                    Choose {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Payment */}
      {currentStep === 5 && (
        <PaymentForm
          onSuccess={handlePaymentSuccess}
          onBack={() => setCurrentStep(4)}
          userInfo={{ email: signupData.email, phone: signupData.profile?.phone || '' }}
          selectedPlan={subscriptionPlans.find(plan => plan.id === signupData.selectedPlan) || subscriptionPlans[1]}
        />
      )}
    </div>
  );
};

export default SignupSteps;
