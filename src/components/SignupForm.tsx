
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Crown, Check, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import PaymentForm from "./PaymentForm";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [wantsSubscription, setWantsSubscription] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (wantsSubscription) {
        setShowPayment(true);
      } else {
        await signup(email, password, phone, false);
      }
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      await signup(email, password, phone, true);
      console.log('Payment processed:', paymentData);
    } catch (error) {
      console.error('Signup after payment failed:', error);
    }
  };

  if (showPayment) {
    return (
      <PaymentForm
        onSuccess={handlePaymentSuccess}
        onBack={() => setShowPayment(false)}
        userInfo={{ email, phone }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Join MealCraft</h2>
        <p className="text-gray-600">Choose your plan and start planning healthier meals today</p>
      </div>

      {/* Plan Comparison */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className={`border-2 transition-all ${!wantsSubscription ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Free Plan</span>
              <span className="text-2xl font-bold text-green-600">$0</span>
            </CardTitle>
            <CardDescription>Perfect for trying out MealCraft</CardDescription>
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
                <Check className="h-4 w-4 text-green-500" />
                <span>Shopping list generation</span>
              </li>
              <li className="flex items-center space-x-2">
                <X className="h-4 w-4 text-red-500" />
                <span>No grocery store integration</span>
              </li>
              <li className="flex items-center space-x-2">
                <X className="h-4 w-4 text-red-500" />
                <span>No recipe videos</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className={`border-2 transition-all ${wantsSubscription ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'}`}>
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
                <span>Smart shopping lists</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Walmart & Smith's integration</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Recipe video tutorials</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Priority customer support</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Signup Form */}
      <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-green-200 focus:border-green-400"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-green-200 focus:border-green-400"
              />
            </div>

            <div className="flex items-center space-x-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Checkbox
                id="subscription"
                checked={wantsSubscription}
                onCheckedChange={(checked) => setWantsSubscription(checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="subscription" className="text-sm font-medium text-orange-800">
                  Subscribe to Premium Plan ($9.99/month)
                </Label>
                <p className="text-xs text-orange-600">
                  Get 5 meal plans per month and grocery store integration
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : wantsSubscription ? 'Continue to Payment' : 'Create Free Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;
