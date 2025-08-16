
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, Crown, X } from "lucide-react";

interface SubscriptionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
}

const SubscriptionSuccessModal = ({ 
  isOpen, 
  onClose, 
  planName,
  planPrice 
}: SubscriptionSuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <DialogTitle>Subscription Successful!</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Crown className="h-8 w-8 text-green-600" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to {planName}!
            </h3>
            <DialogDescription className="text-center">
              Your subscription is now active. You'll be charged ${planPrice}/month and have access to all premium features.
            </DialogDescription>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">What's included:</h4>
            <ul className="text-sm text-green-800 space-y-1 text-left">
              <li>• Full access to all premium features</li>
              <li>• Priority customer support</li>
              <li>• Advanced meal planning tools</li>
              <li>• Unlimited recipe generation</li>
            </ul>
          </div>

          <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
            Start Exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionSuccessModal;
