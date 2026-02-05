import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Crown,
  Check,
  X,
  User,
  Mail,
  CreditCard,
  Eye,
  EyeOff,
  Star,
  Sparkles,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import UserProfileForm from "./UserProfileForm";
import OTPVerification from "./OTPVerification";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./PaymentForm";
import WelcomeModal from "./WelcomeModal";
import axios from "axios";
import { getAllSubscriptionTypes } from "@/services/payments";
import { mapApiToPlan, Plan } from "@/utils/mapSubscriptionPlans";
import { trackEvent } from "@/services/analytics";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY! ||
    "pk_live_51R1tMqJXpWWLuVEYpa9L6b12LE2CEegclDZHdxVLwszUpCdrWW7xIxSqYl8KI5BGenJaniAnCwF0Z8EOoUUWLxV100Ff4uHql0"
);

interface SignupData {
  email: string;
  password: string;
  userId?: string;
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
const BasicURL =
  import.meta.env.VITE_BASE_URL || "https://pantry-ms-brain.onrender.com";

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
  const isMobile = useIsMobile();
  const [customerId, setCustomerId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [subscriptionTypes, setSubscriptionTypes] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchSubscriptionTypes = async () => {
      try {
        const responseSubscriptionTypes = await getAllSubscriptionTypes();
        console.log("this a response ", responseSubscriptionTypes);
        setSubscriptionTypes(mapApiToPlan(responseSubscriptionTypes));
      } catch (err: any) {
        console.log("error getting subscription types");
      }
    };

    fetchSubscriptionTypes();
  }, []);

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Sending signup request to API:", signupData.email);

      const requestData = {
        email: signupData.email,
        password: signupData.password,
      };

      const config = {
        method: "post",
        url: `${BasicURL}/security/signup`,
        headers: {
          "Content-Type": "application/json",
        },
        data: requestData,
      };

      const response = await axios.request(config);
      console.log("Signup API response:", response.data);

      // Check if response indicates success with the correct structure
      if (
        response.data.message &&
        response.data.message.includes("OTP code has been sent") &&
        response.data.response?.userId
      ) {
        console.log("Showing success toast");
        toast({
          title: "✅ Account Created Successfully!",
          description: "An OTP code has been sent to your email address.",
          duration: 5000,
        });

        // Store userId for OTP verification
        setSignupData((prev) => ({
          ...prev,
          userId: response.data.response.userId,
        }));
        setCurrentStep(2);
      } else {
        console.log("Unexpected response format, throwing error");
        throw new Error("Unexpected response format");
      }
    } catch (error: any) {
      console.error("Signup failed:", error);

      // Handle API error responses
      if (error.response?.data?.message) {
        const errorMessage =
          typeof error.response.data.message === "string"
            ? error.response.data.message
            : error.response.data.message.message || "Signup failed";

        console.log("Showing error toast with message:", errorMessage);
        toast({
          title: "❌ Signup Failed",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
      } else {
        console.log("Showing generic error toast");
        toast({
          title: "❌ Signup Failed",
          description: "Unable to create account. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = () => {
    console.log("OTP verified successfully");
    setCurrentStep(3);
  };

  const handleProfileComplete = (profileData: any) => {
    console.log("Profile data saved:", profileData);

    setSignupData((prev) => ({ ...prev, profile: profileData }));
    setCurrentStep(4);
  };

  const handleSubscriptionChoice = async (planId: string) => {
    console.log("Subscription choice:", planId);
    const selectedPlan = subscriptionTypes.find((plan) => plan.id === planId);
    setSignupData((prev) => ({
      ...prev,
      wantsSubscription: selectedPlan?.name !== "Free",
      selectedPlan: planId,
    }));

    if (selectedPlan?.name === "Free") {
      // Handle Free subscription - register directly without payment
      await handleFreeSubscription(planId);
    } else {
      setCurrentStep(5);
    }
  };

  const handleFreeSubscription = async (planId: string) => {
    try {
      if (!userId) {
        console.warn("Free subscription aborted: missing userId");
        toast({
          title: "❌ Subscription Failed",
          description:
            "We couldn't find your user ID. Please complete your profile and try again.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      console.log("Registering free subscription for user:", userId);

      const subscriptionData = {
        subscriptionTypeId: planId, // API expects only this in the body
      };

      const config = {
        method: "post",
        url: `${BasicURL}/subscription/${userId}`, // userId only in the path
        headers: {
          "Content-Type": "application/json",
        },
        data: subscriptionData,
      };

      const response = await axios.request(config);
      console.log("Free subscription response:", response.data);

      if (response.data) {
        toast({
          title: "✅ Free Subscription Activated!",
          description:
            "Your free subscription has been activated successfully.",
          duration: 5000,
        });

        completeSignup();
      } else {
        throw new Error("Failed to activate free subscription");
      }
    } catch (error: any) {
      console.error("Free subscription failed:", error);

      const errorMessage =
        error.response?.data?.message || "Failed to activate free subscription";
      toast({
        title: "❌ Subscription Failed",
        description:
          typeof errorMessage === "string"
            ? errorMessage
            : "Failed to activate free subscription",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    console.log("Payment processed:", paymentData);
    completeSignup();
  };

  const completeSignup = async () => {
    try {
      console.log("Mock: Completing signup with data:", signupData);

      const userData = {
        name: signupData.profile?.name || signupData.email.split("@")[0],
        email: signupData.email,
        phone: signupData.profile?.phone || "",
        preferences: signupData.profile
          ? {
              dietaryRestrictions: [],
              allergies: signupData.profile.allergies || [],
              cuisinePreferences: [],
              cookingSkillLevel: "beginner" as const,
              mealPrepTime: 30,
              budgetRange: "medium" as const,
            }
          : undefined,
      };

      await signup(userData);

      console.log("Mock: Signup completed, showing welcome modal");

      setTimeout(() => {
        setShowWelcome(true);
      }, 100);
    } catch (error) {
      console.error("Mock: Signup failed:", error);
    }
  };

  const handleWelcomeClose = () => {
    console.log("Mock: Welcome modal closed, user should now see dashboard");
    setShowWelcome(false);
  };

  const stepItems = [
    { step: 1, title: t("signup.account") || "Account", icon: User, color: "from-primary to-accent" },
    {
      step: 2,
      title: t("signup.verify") || "Verify",
      icon: Mail,
      color: "from-primary to-secondary",
    },
    { step: 3, title: t("signup.profile") || "Profile", icon: User, color: "from-accent to-primary" },
    { step: 4, title: t("signup.plan") || "Plan", icon: Crown, color: "from-primary to-accent" },
    {
      step: 5,
      title: t("signup.payment") || "Payment",
      icon: CreditCard,
      color: "from-secondary to-primary",
    },
  ];

  if (showWelcome) {
    return <WelcomeModal onClose={handleWelcomeClose} />;
  }

  return (
    <div className="max-w-full mx-auto space-y-4 sm:space-y-6">
      <div className="relative mb-6 sm:mb-8">
        <div className="flex justify-center">
          <div
            className={`flex items-center ${
              isMobile ? "space-x-2" : "space-x-4 sm:space-x-6"
            } px-2 sm:px-0`}
          >
            {stepItems.map(({ step, title, icon: Icon, color }, index) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`relative flex items-center justify-center ${
                      isMobile ? "w-10 h-10" : "w-12 h-12 sm:w-14 sm:h-14"
                    } rounded-full transition-all duration-500 ${
                      currentStep >= step
                        ? `bg-gradient-to-r ${color} text-white shadow-lg border-2 border-primary/20 ${
                            isMobile ? "scale-105" : "scale-110"
                          }`
                        : "bg-background border-2 border-border text-muted-foreground shadow-md"
                    }`}
                  >
                    {currentStep > step ? (
                      <Check
                        className={`${
                          isMobile ? "h-4 w-4" : "h-5 w-5 sm:h-6 sm:w-6"
                        }`}
                      />
                    ) : (
                      <Icon
                        className={`${
                          isMobile ? "h-4 w-4" : "h-5 w-5 sm:h-6 sm:w-6"
                        }`}
                      />
                    )}

                    {currentStep === step && (
                      <div
                        className={`absolute inset-0 rounded-full bg-gradient-to-r ${color} opacity-20 animate-pulse scale-125`}
                      ></div>
                    )}
                  </div>

                  <span
                    className={`mt-2 text-xs font-medium transition-all duration-300 ${
                      isMobile ? "hidden" : ""
                    } ${
                      currentStep >= step
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {title}
                  </span>
                </div>

                {index < stepItems.length - 1 && (
                  <div
                    className={`${
                      isMobile ? "w-4 h-0.5" : "w-8 sm:w-16 h-1"
                    } mx-2 sm:mx-4 rounded-full transition-all duration-500 ${
                      currentStep > step
                        ? `bg-gradient-to-r ${stepItems[index + 1].color}`
                        : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {currentStep === 1 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl blur-xl"></div>
          <Card className="relative max-w-full sm:max-w-lg mx-auto bg-card/95 backdrop-blur-sm border-border shadow-xl rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>

            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-2.5 bg-gradient-to-r from-primary to-accent rounded-xl shadow-lg">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {t("signup.account.title")}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-muted-foreground">
                {t("signup.account.description")}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <form
                onSubmit={handleBasicInfoSubmit}
                className="space-y-4 sm:space-y-5"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    {t("signup.account.email")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                      className="h-11 sm:h-12 text-sm border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl transition-all duration-200 bg-background/50 focus:bg-background"
                      placeholder={t("signup.emailPlaceholder") || "Enter your email address"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    {t("signup.account.password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                      className="h-11 sm:h-12 text-sm border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl transition-all duration-200 bg-background/50 focus:bg-background pr-12"
                      placeholder={t("signup.passwordPlaceholder") || "Create a secure password"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted rounded-lg"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  disabled={isLoading}
                  onClick={async () => {
                    console.log('step 1 signup');
                    trackEvent('button_click', {
                              button_name: `step${currentStep}_submit`,
                              screen: 'signup_page',
                            })

                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                      <span>{t("signup.account.sending")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>{t("signup.account.continue")}</span>
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 2 && (
        <OTPVerification
          email={signupData.email}
          userId={signupData.userId || ""}
          onVerified={handleOTPVerified}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 3 && (
        <UserProfileForm
          onComplete={handleProfileComplete}
          onBack={() => setCurrentStep(2)}
          userId={signupData.userId}
          setCustomer={setCustomerId}
          setUserId={setUserId}
        />
      )}

      {currentStep === 4 && (
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-3 px-2 sm:px-0">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-primary to-accent rounded-2xl shadow-lg">
                <Crown className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {t("signup.choosePlan") || "Choose your plan"}
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto">
              {t("signup.selectPlanDescription") || "Select the perfect plan to start your personalized meal planning"}  
              {t("signup.journey") || "journey"}
            </p>
          </div>

          <div
            className={`grid ${
              isMobile
                ? "grid-cols-1 gap-4"
                : "grid-cols-1 lg:grid-cols-3 gap-6"
            } px-1 sm:px-0`}
          >
            {subscriptionTypes.map((plan, index) => (
              <div key={plan.id} className="relative group">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-all duration-500`}
                ></div>

                <Card
                  className={`relative cursor-pointer transition-all duration-500 border-2 rounded-2xl overflow-hidden h-full transform group-hover:scale-[1.02] group-hover:shadow-xl ${
                    plan.popular
                      ? "border-primary shadow-xl bg-gradient-to-b from-card to-primary/5"
                      : "border-border hover:border-primary/50 bg-card shadow-lg"
                  }`}
                  onClick={() => handleSubscriptionChoice(plan.id)}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.gradient}`}
                  ></div>

                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{t("signup.mostPopular") || "Most Popular"}</span>
                      </div>
                    </div>
                  )}

                  <CardHeader className="text-center pb-3 px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex justify-center mb-3">
                      <div
                        className={`p-2.5 bg-gradient-to-r ${plan.gradient} rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Crown className="h-6 w-6 text-primary-foreground" />
                      </div>
                    </div>

                    <CardTitle className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                      {plan.name}
                    </CardTitle>

                    <div className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                      {plan.price === 0 ? (
                        <span className="bg-gradient-to-r from-muted-foreground to-foreground bg-clip-text text-transparent">
                          {t("signup.plan.free") || "Free"}
                        </span>
                      ) : (
                        <span
                          className={`bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}
                        >
                          ${plan.price / 100}
                        </span>
                      )}
                      {plan.price > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">
                          /{plan.interval}
                        </span>
                      )}
                    </div>

                    <CardDescription className="text-sm text-muted-foreground min-h-[2.5rem] flex items-center justify-center px-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col justify-between flex-1">
                    <div className="mb-4">
                      <h4 className="font-bold text-foreground mb-3 text-center">
                        {t("signup.plan.whatsIncluded") || "What's included"}
                      </h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start space-x-2"
                          >
                            <div
                              className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center mt-0.5`}
                            >
                              <Check className="h-3 w-3 text-primary-foreground font-bold" />
                            </div>
                            <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      className={`w-full h-11 sm:h-12 text-sm font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                        plan.name === "Free"
                          ? "bg-gradient-to-r from-muted to-muted-foreground hover:from-muted/90 hover:to-muted-foreground/90 text-muted-foreground"
                          : `bg-gradient-to-r ${plan.gradient} hover:shadow-2xl text-primary-foreground`
                      }`}
                      onClick={async () => {
                        console.log('step 4 plan selection');
                        trackEvent('button_click', {
                                  button_name: `step${currentStep}_signup_plan${plan.name}_submit`,
                                  screen: 'signup_page',
                                })
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{t("signup.plan.choose") || "Choose"} {plan.name}</span>
                        <Sparkles className="h-4 w-4" />
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStep === 5 && (
        <Elements stripe={stripePromise}>
          <PaymentForm
            onSuccess={handlePaymentSuccess}
            onBack={() => setCurrentStep(4)}
            userInfo={{
              email: signupData.email,
              phone: signupData.profile?.phone || "",
              customerId: customerId,
              userId: userId,
            }}
            selectedPlan={
              subscriptionTypes.find(
                (plan) => plan.id === signupData.selectedPlan
              ) || subscriptionTypes[1]
            }
          />
        </Elements>
      )}
    </div>
  );
};

export default SignupSteps;
