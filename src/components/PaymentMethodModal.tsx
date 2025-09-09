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
import {
  getUserPaymentMethods,
  UserPaymentMethod,
  subscribeUser,
  setDefaultPaymentMethod,
  createStripeProduct,
  createStripePrice,
  createStripeSubscription,
} from "@/services/payments";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { Plan } from "@/utils/mapSubscriptionPlans";
import PaymentForm2 from "./PaymentForm2";


const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY! ||
    "pk_test_51R1tN0QtxIPdrkdTWoyJxB3qmuoh8FVEpRSQFEfCkGQFScfq8TRzCZz4ZJbXxkvhjwTw3vEuyrCizyg1APYcQcrJ00YgxWKyQ5"
);

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
  selectedPlan,
}: PaymentMethodModalProps) => {
  const { user } = useUser();
  const { user: authUser } = useAuth();
  const {updateSubscription} = useAuth();

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
  const [subscriptionTypes, setSubscriptionTypes] = useState<Plan[]>([]);

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
      const defaultMethod = methods.find((method) => method.isDefault);
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
      console.error("Error fetching payment methods:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMethods(false);
    }
  };

  const handleSubscribe = async () => {
    setIsProcessing(true);
    //check for a payment method
    if (!selectedPaymentMethod) {
      toast({
        title: "No Payment Method",
        description: "Please select a payment method first.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    try {
      // Step 1: Check if selected payment method is default, if not set it as default
      const selectedMethod = paymentMethods.find(
        (method) => method.id === selectedPaymentMethod
      );
      if (selectedMethod && !selectedMethod.isDefault) {
        console.log("Setting payment method as default...");
        await setDefaultPaymentMethod(selectedPaymentMethod, rukuClientId);
        toast({
          title: "Payment Method Updated",
          description: "Payment method set as default.",
        });
      }

      // Step 2: Create Stripe product
      console.log("Creating Stripe product...");
      const product = await createStripeProduct(
        selectedPlan.name,
        `${selectedPlan.name} subscription plan`
      );
      console.log("Product created:", product);

      // Step 3: Create Stripe price
      console.log("Creating Stripe price...");
      const price = await createStripePrice(
        product.id,
        selectedPlan.price * 100, // Convert to cents
        "usd",
        "month"
      );
      console.log("Price created:", price);

      // Step 4: Create Stripe subscription
      console.log("Creating Stripe subscription...");
      const subscription = await createStripeSubscription(
        rukuClientId,
        price.id
      );
      console.log("Subscription created:", subscription);

      // Step 5: Call subscribeUser with the actual subscription ID
      console.log("Calling subscribeUser...");
      const result = await subscribeUser(
        userId,
        selectedPlan.id,
        subscription.id
      );
      console.log("Subscription result:", result);

      //update the subscription in the user
        updateSubscription(result.return)

      onSuccess();
      toast({
        title: "Subscription Successful!",
        description:
          result.message ||
          `Welcome to ${selectedPlan.name}! Your subscription is now active.`,
      });
      onClose();
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Payment Failed",
        description:
          "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddCard = async (paymentData: any) => {
    console.log("this is the received information ", paymentData);

    setIsProcessing(true);
    try {
      // Simulate API call to add card
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Subscription updated!",
        description: "Your subscription was updated successfully.",
      });
      setShowAddCard(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your subscription. Please try again.",
        variant: "destructive",
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
          </div>
          <DialogDescription>
            Select a payment method for your {selectedPlan.name} subscription ($
            {selectedPlan.price}/month)
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
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                >
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg"
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label
                        htmlFor={method.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5 text-gray-600" />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium capitalize">
                                  {method.brand}
                                </span>
                                <span>•••• {method.last4}</span>
                                {method.isDefault && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                Expires{" "}
                                {method.exp_month.toString().padStart(2, "0")}/
                                {method.exp_year}
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
                  <h4 className="font-semibold text-gray-800">
                    {selectedPlan.name} Plan
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedPlan.price}/month
                  </p>
                </div>
                <Button
                  onClick={handleSubscribe}
                  disabled={isProcessing || !selectedPaymentMethod}
                  className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                >
                  {isProcessing ? "Processing..." : "Subscribe Now"}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between"></div>

              <div className="space-y-4">
                <Elements stripe={stripePromise}>
                  <PaymentForm2
                    onSuccess={handleAddCard}
                    onBack={() => setShowAddCard(false)}
                    userInfo={{
                      email: user.email,
                      phone: user.phone || "",
                      customerId: authUser.profile.ruku_client_id,
                      userId: userId,
                    }}
                    selectedPlan={{
                      id: selectedPlan.id,
                      name: selectedPlan.name,
                      price: selectedPlan.price * 100,
                      features: [""],
                      interval: "",
                    }}
                  />
                </Elements>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodModal;
