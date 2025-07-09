
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Lock, ArrowLeft } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
}

interface PaymentFormProps {
  onSuccess: (paymentData: any) => void;
  onBack: () => void;
  userInfo: {
    email: string;
    phone: string;
  };
  selectedPlan: SubscriptionPlan;
}

const PaymentForm = ({ onSuccess, onBack, userInfo, selectedPlan }: PaymentFormProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(formatExpiryDate(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // TODO: Replace with your payment service call
      const paymentData = {
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryDate,
        cvv,
        cardName,
        billingCycle,
        amount: billingCycle === 'monthly' ? selectedPlan.price : selectedPlan.price * 12,
        email: userInfo.email,
        phone: userInfo.phone,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
      };

      console.log('Processing payment:', paymentData);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSuccess(paymentData);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const monthlyPrice = selectedPlan.price;
  const yearlyPrice = selectedPlan.price * 12 * 0.83; // 17% discount for yearly
  const yearlyDiscount = ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12) * 100).toFixed(0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Complete Your Subscription</h2>
          <p className="text-gray-600">Secure payment processing for {selectedPlan.name}</p>
        </div>
      </div>

      {/* Billing Cycle Selection */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Choose Your Billing Cycle</CardTitle>
          <CardDescription>Select how you'd like to be billed for {selectedPlan.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                billingCycle === 'monthly' ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Monthly</h4>
                  <p className="text-sm text-gray-600">Billed every month</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">${monthlyPrice}</span>
                  <p className="text-sm text-gray-600">/month</p>
                </div>
              </div>
            </div>

            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                billingCycle === 'yearly' ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
              onClick={() => setBillingCycle('yearly')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Yearly</h4>
                  <p className="text-sm text-gray-600">Save {yearlyDiscount}% annually</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">${yearlyPrice.toFixed(2)}</span>
                  <p className="text-sm text-gray-600">/year</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Information</span>
          </CardTitle>
          <CardDescription>Your payment information is secure and encrypted</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
                className="border-green-200 focus:border-green-400"
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={handleCardNumberChange}
                required
                className="border-green-200 focus:border-green-400"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  value={expiryDate}
                  onChange={handleExpiryChange}
                  required
                  className="border-green-200 focus:border-green-400"
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                  required
                  className="border-green-200 focus:border-green-400"
                  placeholder="123"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold mb-2">Order Summary</h4>
              <div className="flex justify-between items-center">
                <span>{selectedPlan.name} ({billingCycle})</span>
                <span className="font-bold">
                  ${billingCycle === 'monthly' ? monthlyPrice : yearlyPrice.toFixed(2)}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <div className="text-sm text-green-600 mt-1">
                  You save ${(monthlyPrice * 12 - yearlyPrice).toFixed(2)} per year!
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="h-4 w-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing Payment...' : `Subscribe for $${billingCycle === 'monthly' ? monthlyPrice : yearlyPrice.toFixed(2)}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentForm;
