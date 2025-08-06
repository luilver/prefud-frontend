import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Check, X, User, Mail, CreditCard, Eye, EyeOff, Star, Sparkles } from "lucide-react";
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
      popular: false,
      gradient: "from-gray-500 to-gray-600"
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
      popular: true,
      gradient: "from-green-500 to-orange-500"
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
      popular: false,
      gradient: "from-purple-600 to-blue-600"
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
    { step: 1, title: "Account", icon: User, color: "from-blue-500 to-cyan-500" },
    { step: 2, title: "Verify", icon: Mail, color: "from-purple-500 to-pink-500" },
    { step: 3, title: "Profile", icon: User, color: "from-green-500 to-teal-500" },
    { step: 4, title: "Plan", icon: Crown, color: "from-orange-500 to-red-500" },
    { step: 5, title: "Payment", icon: CreditCard, color: "from-indigo-500 to-purple-500" },
  ];

  if (showWelcome) {
    return <WelcomeModal onClose={handleWelcomeClose} />;
  }

  return (
    <div className="max-w-full sm:max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Enhanced Progress Steps with animations and gradients */}
      <div className="relative mb-8 sm:mb-12">
        <div className="flex justify-center overflow-x-auto pb-4">
          <div className="flex items-center space-x-3 sm:space-x-6 px-4 sm:px-0 min-w-max">
            {stepItems.map(({ step, title, icon: Icon, color }, index) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-500 ${
                    currentStep >= step 
                      ? `bg-gradient-to-r ${color} text-white shadow-lg scale-110` 
                      : 'bg-white border-2 border-gray-300 text-gray-400 shadow-sm'
                  }`}>
                    {currentStep > step ? (
                      <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                    ) : (
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    )}
                    
                    {/* Animated ring for current step */}
                    {currentStep === step && (
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${color} opacity-20 animate-pulse scale-125`}></div>
                    )}
                  </div>
                  
                  <span className={`mt-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                    currentStep >= step 
                      ? 'text-gray-800 font-semibold' 
                      : 'text-gray-400'
                  }`}>
                    {title}
                  </span>
                </div>
                
                {index < stepItems.length - 1 && (
                  <div className={`w-8 sm:w-16 h-1 mx-4 rounded-full transition-all duration-500 ${
                    currentStep > step 
                      ? `bg-gradient-to-r ${stepItems[index + 1].color}` 
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 1: Basic Info - Enhanced design */}
      {currentStep === 1 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-3xl blur-xl"></div>
          <Card className="relative max-w-full sm:max-w-lg mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            
            <CardHeader className="px-6 sm:px-8 py-6 sm:py-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                  <User className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {t('signup.account.title')}
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-gray-600">
                {t('signup.account.description')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
              <form onSubmit={handleBasicInfoSubmit} className="space-y-5 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base font-medium text-gray-700">
                    {t('signup.account.email')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="h-12 sm:h-14 text-sm sm:text-base border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-200 bg-gray-50/50 focus:bg-white"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm sm:text-base font-medium text-gray-700">
                    {t('signup.account.password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="h-12 sm:h-14 text-sm sm:text-base border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-200 bg-gray-50/50 focus:bg-white pr-12"
                      placeholder="Create a secure password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
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
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{t('signup.account.sending')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>{t('signup.account.continue')}</span>
                      <Sparkles className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: OTP Verification */}
      {currentStep === 2 && (
        <OTPVerification 
          email={signupData.email}
          onVerified={handleOTPVerified}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {/* Step 3: User Profile */}
      {currentStep === 3 && (
        <UserProfileForm 
          onComplete={handleProfileComplete}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {/* Step 4: Subscription Choice - Enhanced design */}
      {currentStep === 4 && (
        <div className="space-y-8 sm:space-y-12">
          {/* Header with enhanced styling */}
          <div className="text-center space-y-4 px-4 sm:px-0">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl shadow-2xl">
                <Crown className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Choose Your Plan
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Select the perfect plan to start your personalized meal planning journey
            </p>
          </div>

          {/* Enhanced plan cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 px-2 sm:px-0">
            {subscriptionPlans.map((plan, index) => (
              <div key={plan.id} className="relative group">
                {/* Background gradient blur */}
                <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} opacity-0 group-hover:opacity-10 rounded-3xl blur-xl transition-all duration-500`}></div>
                
                <Card 
                  className={`relative cursor-pointer transition-all duration-500 border-2 rounded-3xl overflow-hidden h-full transform group-hover:scale-[1.02] group-hover:shadow-2xl ${
                    plan.popular 
                      ? 'border-green-400 shadow-2xl bg-gradient-to-b from-white to-green-50/30' 
                      : 'border-gray-200 hover:border-gray-300 bg-white shadow-lg'
                  }`}
                  onClick={() => handleSubscriptionChoice(plan.id)}
                >
                  {/* Top gradient line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.gradient}`}></div>
                  
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-green-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center space-x-2">
                        <Star className="h-4 w-4 fill-current" />
                        <span>Most Popular</span>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4 px-6 sm:px-8 py-8 sm:py-10">
                    <div className="flex justify-center mb-6">
                      <div className={`p-4 bg-gradient-to-r ${plan.gradient} rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                        <Crown className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                      {plan.name}
                    </CardTitle>
                    
                    <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                      {plan.price === 0 ? (
                        <span className="bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">Free</span>
                      ) : (
                        <span className={`bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                          ${plan.price}
                        </span>
                      )}
                      {plan.price > 0 && <span className="text-lg font-normal text-gray-500">/{plan.interval}</span>}
                    </div>
                    
                    <CardDescription className="text-base text-gray-600 min-h-[3rem] flex items-center justify-center px-4">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-6 sm:px-8 pb-8 flex flex-col justify-between flex-1">
                    <div className="mb-8">
                      <h4 className="font-bold text-gray-800 mb-6 text-center text-lg">What's included</h4>
                      <ul className="space-y-4">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mt-0.5`}>
                              <Check className="h-3 w-3 text-white font-bold" />
                            </div>
                            <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      className={`w-full h-14 text-base font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                        plan.id === 'free' 
                          ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white' 
                          : `bg-gradient-to-r ${plan.gradient} hover:shadow-2xl text-white`
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>Choose {plan.name}</span>
                        <Sparkles className="h-5 w-5" />
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </div>
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
