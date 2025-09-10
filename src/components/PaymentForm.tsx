import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, ArrowLeft } from "lucide-react";
import {
  attachPaymentMethod,
  createPaymentMethod,
  createStripePrice,
  createStripeProduct,
  createStripeSubscription,
  persistUserSubscription,
  setDefaultPaymentMethod,
} from "@/services/payments";

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
    customerId: string;
    userId: string;
  };
  selectedPlan: SubscriptionPlan;
}

const PaymentForm = ({
  onSuccess,
  onBack,
  userInfo,
  selectedPlan,
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error("Ruku has not loaded yet");
      return;
    }

    setIsProcessing(true);

    try {
      // Create a Stripe token from card info
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) throw new Error("Card element not found");

      const { error, token } = await stripe.createToken(cardNumberElement);

      if (error) {
        console.error("[Token Error]", error);
        alert(error.message);
        return;
      }

      console.log("[Token]", token);

      if (error) {
        console.error("Stripe token error:", error);
        setIsProcessing(false);
        return;
      }

      console.log("Ruku token received:", token);
      //0. create a payment method with the card token

      try {
        const responsePaymentMethod = await createPaymentMethod(token.id);
        console.log("response create payment method ", responsePaymentMethod);

        //1. attach payment method to client
        try {
          const responseAttach = await attachPaymentMethod(
            responsePaymentMethod.id,
            userInfo.customerId
          );
          console.log("responseAttach ", responseAttach);
          if (responseAttach) {
            console.log("response attach id ", responseAttach.id);
            // 1.5. set default payment method
            const responseDefaultPaymentMethod = await setDefaultPaymentMethod(
              responsePaymentMethod.id,
              userInfo.customerId
            );

            console.log(
              "set default payment method ",
              responseDefaultPaymentMethod
            );

            //2. create product
            try {
              const responseCreateProduct = await createStripeProduct(
                selectedPlan.name,
                selectedPlan.price.toString()
              );
              console.log("response product ", responseCreateProduct);
              if (responseCreateProduct) {
                // 3. create a price
                const responseCreatePrice = await createStripePrice(
                  responseCreateProduct.id,
                  selectedPlan.price,
                  "usd",
                  "month"
                );
                console.log("create price response ", responseCreatePrice);
                if (responseCreatePrice) {
                  //4. subscribe
                  const responseCreateSubscription =
                    await createStripeSubscription(
                      userInfo.customerId,
                      responseCreatePrice.id
                    );
                  console.log(
                    "response create subscription ",
                    responseCreateSubscription
                  );

                  //5. Persist user subscription
                  const responsePersistSubscription =
                    await persistUserSubscription(
                      userInfo.userId,
                      selectedPlan.id,
                      responseCreateSubscription.id
                    );

                  // You can now send this token to your backend for further processing
                  const paymentData = {
                    tokenId: token.id,
                    billingCycle,
                    amount:
                      billingCycle === "monthly"
                        ? selectedPlan.price
                        : selectedPlan.price * 12,
                    email: userInfo.email,
                    phone: userInfo.phone,
                    planId: selectedPlan.id,
                    planName: selectedPlan.name,
                  };

                  console.log("Payment data to send:", paymentData);

                  onSuccess(paymentData);
                }
              }
            } catch (error) {
              console.log("error creating product ", error);
            }
          }
        } catch (error) {
          console.log("errror attaching payment ", error);
        }
      } catch (error) {
        console.log("error creating payment method");
      }
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const monthlyPrice = selectedPlan.price;
  const yearlyPrice = selectedPlan.price * 12 * 0.83;
  const yearlyDiscount = (
    ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) *
    100
  ).toFixed(0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Complete Your Subscription
          </h2>
          <p className="text-gray-600">
            Secure payment processing for {selectedPlan.name}
          </p>
        </div>
      </div>

      {/* Billing Cycle Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose your billing cycle</CardTitle>
          <CardDescription>Select how you'd like to be billed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer ${
                billingCycle === "monthly"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              <h4 className="font-semibold">Monthly</h4>
              <span className="text-2xl font-bold">${monthlyPrice / 100}</span>
            </div>
            {/* <div
              className={`p-4 border-2 rounded-lg cursor-pointer ${
                billingCycle === "yearly"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              <h4 className="font-semibold">Yearly</h4>
              <span className="text-2xl font-bold">
                ${(yearlyPrice / 100).toFixed(2)}
              </span>
              <p className="text-sm text-green-600">Save {yearlyDiscount}%</p>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Stripe Card Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label>Card Details</Label>
            <div className="space-y-4">
              <div className="p-3 border rounded-md bg-white">
                <CardNumberElement
                  options={{ style: { base: { fontSize: "16px" } } }}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-md bg-white">
                  <CardExpiryElement
                    options={{ style: { base: { fontSize: "16px" } } }}
                    className="w-full"
                  />
                </div>

                <div className="p-3 border rounded-md bg-white">
                  <CardCvcElement
                    options={{ style: { base: { fontSize: "16px" } } }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="h-4 w-4" />
              <span>Your payment is secure by Rukupay LLC</span>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
              disabled={isProcessing || !stripe}
            >
              {isProcessing
                ? "Processing..."
                : `Subscribe for $${
                    billingCycle === "monthly"
                      ? (monthlyPrice / 100).toFixed(2)
                      : (yearlyPrice / 100).toFixed(2)
                  }`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentForm;
