import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, User, CheckCircle } from "lucide-react";
import UserProfileForm from "./UserProfileForm";
import OTPVerification from "./OTPVerification";
import { useToast } from "@/hooks/use-toast";

interface SignupStepIndicatorProps {
  step: number;
}

const SignupStepIndicator: React.FC<SignupStepIndicatorProps> = ({ step }) => {
  const steps = [
    { number: 1, label: "Create Account" },
    { number: 2, label: "Verify Email" },
    { number: 3, label: "Profile" },
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((s) => (
        <div key={s.number} className="flex items-center">
          {s.number < step ? (
            <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 mr-2 flex items-center justify-center">
              <span className="text-gray-500">{s.number}</span>
            </div>
          )}
          <span className="text-sm text-gray-700">{s.label}</span>
          {s.number < steps.length && <Separator orientation="vertical" className="mx-4 h-6" />}
        </div>
      ))}
    </div>
  );
};

const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password: string): boolean => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return regex.test(password);
};

const SignupSteps = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [signupResponse, setSignupResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(userData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address."
      });
      return;
    }

    if (!validatePassword(userData.password)) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
      });
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again."
      });
      return;
    }

    setIsLoading(true);
    console.log('Creating account with:', { email: userData.email });

    try {
      const response = await fetch('https://pantry-auth-1.onrender.com/security/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message?.message || 'Registration failed');
      }

      const result = await response.json();
      console.log('Signup successful:', result);
      
      // Store the entire response including userId
      setSignupResponse(result);
      
      toast({
        title: "Account Created!",
        description: result.message || "Please check your email for verification."
      });

      setCurrentStep(2);
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to create account. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerified = () => {
    setCurrentStep(3);
  };

  const handleProfileComplete = (profileData: any) => {
    console.log('Profile completed:', profileData);
    toast({
      title: "Welcome!",
      description: "Your account has been set up successfully."
    });
    // Handle successful signup completion (redirect to dashboard, etc.)
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => {
    return <SignupStepIndicator step={currentStep} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {renderStepIndicator()}
        
        {currentStep === 1 && (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Create Account</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={userData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={userData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={userData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <Button onClick={handleCreateAccount} disabled={isLoading}>
                {isLoading ? (
                  <>
                    Loading
                  </>
                ) : (
                  <>
                    Create Account
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && signupResponse && (
          <OTPVerification 
            email={userData.email}
            userId={signupResponse.response?.userId}
            onVerified={handleEmailVerified}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && signupResponse && (
          <UserProfileForm 
            onComplete={handleProfileComplete}
            onBack={handleBack}
            userId={signupResponse.response?.userId}
          />
        )}
      </div>
    </div>
  );
};

export default SignupSteps;
