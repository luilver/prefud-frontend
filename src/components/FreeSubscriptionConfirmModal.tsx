
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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

  const handleConfirmSwitch = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call to cancel subscription and switch to free
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onConfirm();
      toast({
        title: t('subscription.freeModal.success.title'),
        description: t('subscription.freeModal.success.description'),
      });
      onClose();
    } catch (error) {
      toast({
        title: t('subscription.freeModal.error.title'),
        description: t('subscription.freeModal.error.description'),
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
              <DialogTitle>{t('subscription.freeModal.title')}</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-left">
            {t('subscription.freeModal.description').replace('{{currentPlan}}', currentPlan)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">{t('subscription.freeModal.whatHappens')}</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• {t('subscription.freeModal.features.cancel')}</li>
              <li>• {t('subscription.freeModal.features.immediate')}</li>
              <li>• {t('subscription.freeModal.features.limited')}</li>
              <li>• {t('subscription.freeModal.features.upgrade')}</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              {t('subscription.freeModal.buttons.keep').replace('{{currentPlan}}', currentPlan)}
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmSwitch}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? t('subscription.freeModal.buttons.switching') : t('subscription.freeModal.buttons.switchToFree')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FreeSubscriptionConfirmModal;
