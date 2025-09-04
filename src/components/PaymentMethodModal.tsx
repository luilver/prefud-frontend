
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard, Plus, X, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUserPaymentMethods, UserPaymentMethod, subscribeUser } from "@/services/payments";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rukuClientId: string;
  userId: string;
  selectedPlan: {
    id: string;
    name: string;
    price: number;
  };
}

const PaymentMethodModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  rukuClientId,
  userId,
  selectedPlan 
}: PaymentMethodModalProps) => {
  const [paymentMethods, setPaymentMethods] = useState<UserPaymentMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [showAddCard, setShowAddCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && rukuClientId) {
      fetchPaymentMethods();
    }
  }, [isOpen, rukuClientId]);

  const fetchPaymentMethods = async () => {
    setIsLoadingMethods(true);
    try {
      const methods = await getUserPaymentMethods(rukuClientId);
      setPaymentMethods(methods);
      
      // Auto-select the default payment method or first one
      const defaultMethod = methods.find(method => method.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      } else if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0].id);
      }
      
      // If no payment methods, show add card form
      if (methods.length === 0) {
        setShowAddCard(true);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payment methods. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMethods(false);
    }
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    if (!selectedPaymentMethod) {
      toast({
        title: "No Payment Method",
        description: "Please select a payment method first.",
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }

    try {
      // For now, we're just simulating the subscription process
      // In a real implementation, you would:
      // 1. Create a Stripe subscription using the selected payment method
      // 2. Get the rukusubscriptionID from the Stripe response
      // 3. Call subscribeUser with the actual values
      
      // Simulate rukusubscriptionID (in real implementation, this comes from Stripe)
      const simulatedRukuSubscriptionID = `sub_${Date.now()}`;
      
      // Call the subscribe endpoint
      const result = await subscribeUser(userId, selectedPlan.id, simulatedRukuSubscriptionID);
      console.log('Subscription result:', result);
      
      onSuccess();
      toast({
        title: "Subscription Successful!",
        description: result.message || `Welcome to ${selectedPlan.name}! Your subscription is now active.`,
      });
      onClose();
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddCard = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all card details.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate API call to add card
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Card Added",
        description: "Your payment method has been added successfully.",
      });
      setShowAddCard(false);
      // Reset form
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setCardName("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Choose Payment Method</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Select a payment method for your {selectedPlan.name} subscription (${selectedPlan.price}/month)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isLoadingMethods ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading payment methods...</span>
            </div>
          ) : !showAddCard && paymentMethods.length > 0 ? (
            <>
              <div className="space-y-4">
                <h4 className="font-medium">Saved Payment Methods</h4>
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
                                Expires {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddCard(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Payment Method
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-800">{selectedPlan.name} Plan</h4>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedPlan.price}/month
                  </p>
                </div>
                <Button 
                  onClick={handleSubscribe}
                  disabled={isProcessing || !selectedPaymentMethod}
                  className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                >
                  {isProcessing ? 'Processing...' : 'Subscribe Now'}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Add New Card</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowAddCard(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      maxLength={3}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddCard}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Adding Card...' : 'Add Card'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodModal;
