
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
        title: t('components.freeSubscriptionConfirmModal.success.title'),
        description: t('components.freeSubscriptionConfirmModal.success.description'),
      });
      onClose();
    } catch (error) {
      toast({
        title: t('components.freeSubscriptionConfirmModal.error.title'),
        description: t('components.freeSubscriptionConfirmModal.error.description'),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[90vw] mx-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 flex-shrink-0" />
              <DialogTitle className="text-left text-sm sm:text-base leading-tight">
                {t('components.freeSubscriptionConfirmModal.title')}
              </DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0 h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-left text-xs sm:text-sm mt-2">
            {t('components.freeSubscriptionConfirmModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
            <h4 className="font-medium text-orange-800 mb-2 text-sm sm:text-base">
              {t('components.freeSubscriptionConfirmModal.whatHappens')}
            </h4>
            <ul className="text-xs sm:text-sm text-orange-800 space-y-1">
              <li>• {t('components.freeSubscriptionConfirmModal.features.cancel')}</li>
              <li>• {t('components.freeSubscriptionConfirmModal.features.immediate')}</li>
              <li>• {t('components.freeSubscriptionConfirmModal.features.limited')}</li>
              <li>• {t('components.freeSubscriptionConfirmModal.features.upgrade')}</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
              disabled={isProcessing}
            >
              {t('components.freeSubscriptionConfirmModal.buttons.keep')}
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmSwitch}
              disabled={isProcessing}
              className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
            >
              {isProcessing ? t('components.freeSubscriptionConfirmModal.buttons.switching') : t('components.freeSubscriptionConfirmModal.buttons.switchToFree')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FreeSubscriptionConfirmModal;
