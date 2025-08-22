
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

interface FreeSubscriptionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentPlan: string;
}

const FreeSubscriptionConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  currentPlan 
}: FreeSubscriptionConfirmModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleConfirmSwitch = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call to cancel subscription and switch to free
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onConfirm();
      toast({
        title: "Switched to Free Plan",
        description: "Your subscription has been cancelled and you've been switched to the Free plan.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch to Free plan. Please try again.",
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
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <DialogTitle>Switch to Free Plan</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-left">
            Are you sure you want to cancel your {currentPlan} subscription and switch to the Free plan?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">What happens when you switch to Free:</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Your current subscription will be cancelled</li>
              <li>• You'll be switched to the Free plan immediately</li>
              <li>• Limited features will apply</li>
              <li>• You can upgrade anytime</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Keep {currentPlan}
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmSwitch}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Switching..." : "Switch to Free"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FreeSubscriptionConfirmModal;
