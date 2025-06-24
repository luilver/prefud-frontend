
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Check, X, User, Mail, CreditCard } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import UserProfileForm from "./UserProfileForm";
import OTPVerification from "./OTPVerification";
import PaymentForm from "./PaymentForm";
import WelcomeModal from "./WelcomeModal";

interface SignupData {
  email: string;
  password: string;
  phone: string;
  wantsSubscription: boolean;
  profile?: {
    weight: number;
    height: number;
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
    phone: "",
    wantsSubscription: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const { signup } = useUser();

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Mock: Send OTP to email
      console.log('Mock: Sending OTP to:', signupData.email);
      // Simulate API delay
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

  const handleSubscriptionChoice = (wantsSubscription: boolean) => {
    console.log('Mock: Subscription choice:', wantsSubscription);
    setSignupData(prev => ({ ...prev, wantsSubscription }));
    if (wantsSubscription) {
      setCurrentStep(5);
    } else {
      completeSignup();
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    console.log('Mock: Payment processed:', paymentData);
    completeSignup();
  };

  const completeSignup = async () => {
    try {
      console.log('Mock: Completing signup with data:', signupData);
      
      // Mock signup process
      await signup(
        signupData.email,
        signupData.password,
        signupData.phone,
        signupData.wantsSubscription,
        signupData.profile
      );
      
      console.log('Mock: Signup completed, showing welcome modal');
      
      // Show welcome modal immediately
      setShowWelcome(true);
    } catch (error) {
      console.error('Mock: Signup failed:', error);
    }
  };

  const handleWelcomeClose = () => {
    console.log('Mock: Welcome modal closed, user should now see dashboard');
    setShowWelcome(false);
    // The UserContext will handle showing the dashboard since user is now authenticated
  };

  const stepItems = [
    { step: 1, title: "Basic Info", icon: User },
    { step: 2, title: "Verify Email", icon: Mail },
    { step: 3, title: "Profile", icon: User },
    { step: 4, title: "Subscription", icon: Crown },
    { step: 5, title: "Payment", icon: CreditCard },
  ];

  // Show welcome modal if signup is complete
  if (showWelcome) {
    return <WelcomeModal onClose={handleWelcomeClose} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {stepItems.map(({ step, title, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                {currentStep > step ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= step ? 'text-green-600' : 'text-gray-400'
              }`}>
                {title}
              </span>
              {step < stepItems.length && (
                <div className={`w-8 h-0.5 ml-4 ${
                  currentStep > step ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <CardDescription>Enter your basic information to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) => setSignupData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  className="border-green-200 focus:border-green-400"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="border-green-200 focus:border-green-400"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                disabled={isLoading}
              >
                {isLoading ? 'Sending Verification...' : 'Continue'}
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

      {/* Step 3: User Profile */}
      {currentStep === 3 && (
        <UserProfileForm 
          onComplete={handleProfileComplete}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {/* Step 4: Subscription Choice */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Plan</h2>
            <p className="text-gray-600">Select the plan that works best for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-2 border-gray-200 hover:border-green-500 cursor-pointer transition-all"
                  onClick={() => handleSubscriptionChoice(false)}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Free Plan</span>
                  <span className="text-2xl font-bold text-green-600">$0</span>
                </CardTitle>
                <CardDescription>Perfect for trying out Pantry</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>1 AI meal plan per month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Basic calorie tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <X className="h-4 w-4 text-red-500" />
                    <span>No grocery store integration</span>
                  </li>
                </ul>
                <Button className="w-full mt-4" variant="outline">
                  Choose Free Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-500 ring-2 ring-orange-200 cursor-pointer"
                  onClick={() => handleSubscriptionChoice(true)}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-orange-500" />
                    <span>Premium Plan</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">$9.99</span>
                </CardTitle>
                <CardDescription>Everything you need for meal planning success</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>5 AI meal plans per month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Advanced nutrition tracking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Walmart & Smith's integration</span>
                  </li>
                </ul>
                <Button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  Choose Premium Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 5: Payment */}
      {currentStep === 5 && (
        <PaymentForm
          onSuccess={handlePaymentSuccess}
          onBack={() => setCurrentStep(4)}
          userInfo={{ email: signupData.email, phone: signupData.phone }}
        />
      )}
    </div>
  );
};

export default SignupSteps;
