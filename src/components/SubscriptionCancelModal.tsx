
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cancelUserSubscription } from "@/services/payments";

interface SubscriptionCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: string;
  userId: string;
}

const SubscriptionCancelModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  currentPlan,
  userId 
}: SubscriptionCancelModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleConfirmCancel = async () => {
    setIsProcessing(true);
    try {
      const result = await cancelUserSubscription(userId);
      
      if (result.success) {
        onConfirm();
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been cancelled successfully.",
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to cancel subscription. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <DialogTitle>Cancel Subscription</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-left">
            Are you sure you want to cancel your {currentPlan} subscription?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">What happens when you cancel:</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• You'll be switched to the Free plan</li>
              <li>• You'll keep access until your billing period ends</li>
              <li>• You can resubscribe anytime</li>
              <li>• Your data will be preserved</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionCancelModal;
