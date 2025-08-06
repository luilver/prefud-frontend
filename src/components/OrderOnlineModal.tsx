
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderOnlineModalProps {
  meal: any;
  ingredients: any[];
  isOpen: boolean;
  onClose: () => void;
}

const OrderOnlineModal = ({ meal, ingredients, isOpen, onClose }: OrderOnlineModalProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderItems, setOrderItems] = useState(
    ingredients.map((ingredient, index) => ({
      id: index,
      name: ingredient.name,
      quantity: `${ingredient.quantity} ${ingredient.unit}`,
      price: (Math.random() * 5 + 1).toFixed(2), // Random price for demo
      selected: true
    }))
  );

  const steps = [
    { id: 1, name: "Items", icon: "📦" },
    { id: 2, name: "Address", icon: "📍" },
    { id: 3, name: "Payment", icon: "💳" },
    { id: 4, name: "Review", icon: "✓" }
  ];

  const totalItems = orderItems.filter(item => item.selected).length;
  const totalPrice = orderItems
    .filter(item => item.selected)
    .reduce((sum, item) => sum + parseFloat(item.price), 0);

  const toggleItem = (itemId: number) => {
    setOrderItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete order
      toast({
        title: "Order Placed Successfully!",
        description: `Your order for ${totalItems} items will be delivered soon. Total: $${totalPrice.toFixed(2)}`,
      });
      onClose();
      setCurrentStep(1);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Complete your order for ingredients from {meal.name}</p>
              <Badge variant="outline">{totalItems} items</Badge>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {orderItems.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                    item.selected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      item.selected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                    }`}>
                      {item.selected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Delivery Address</h3>
              <p className="text-gray-600">Where should we deliver your ingredients?</p>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="font-medium">John Doe</p>
              <p className="text-gray-600">123 Main Street</p>
              <p className="text-gray-600">New York, NY 10001</p>
              <p className="text-gray-600">United States</p>
            </div>
            <Button variant="outline" className="w-full">Change Address</Button>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Payment Method</h3>
              <p className="text-gray-600">How would you like to pay?</p>
            </div>
            <div className="space-y-3">
              <div className="p-4 border rounded-lg border-orange-500 bg-orange-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Credit Card •••• 4242</p>
                    <p className="text-sm text-gray-600">Expires 12/25</p>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full">Add New Payment Method</Button>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Review Your Order</h3>
              <p className="text-gray-600">Please review your order before placing it</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Items ({totalItems}):</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>$4.99</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${(totalPrice * 0.08).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${(totalPrice + 4.99 + totalPrice * 0.08).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                🚚 Estimated delivery: 2-4 hours
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-orange-800">
              Order Groceries Online
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= step.id 
                    ? 'bg-orange-500 text-white' 
                    : currentStep === step.id 
                      ? 'bg-orange-100 text-orange-600 border-2 border-orange-500'
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.icon}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-orange-600' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-px mx-2 ${
                    currentStep > step.id ? 'bg-orange-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {getStepContent()}

          {/* Actions */}
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleContinue}
              disabled={currentStep === 1 && totalItems === 0}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {currentStep === 4 ? 'Place Order' : `Continue to ${steps[currentStep]?.name}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderOnlineModal;
