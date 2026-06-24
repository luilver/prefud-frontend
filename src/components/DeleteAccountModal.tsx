import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isNativePlatform } from "@/services/revenueCatService";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

const DeleteAccountModal = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
}: DeleteAccountModalProps) => {
  const { t } = useLanguage();
  const isNative = isNativePlatform();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {t("profile.deleteAccount.title") || "Delete Account"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-center pt-2 text-gray-600">
            {t("profile.deleteAccount.description") ||
              "This action is permanent and cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">
              {t("profile.deleteAccount.warningTitle") ||
                "By deleting your account:"}
            </h4>
            <ul className="text-sm text-red-700 space-y-1.5">
              {!isNative && (
              <li className="flex items-start space-x-2">
                <span className="mt-0.5">•</span>
                <span>
                  {t("profile.deleteAccount.cancelSub") ||
                    "Your active subscription will be cancelled immediately"}
                </span>
              </li>
              )}
              <li className="flex items-start space-x-2">
                <span className="mt-0.5">•</span>
                <span>
                  {t("profile.deleteAccount.deleteData") ||
                    "All your personal data, meal plans, and recipes will be permanently deleted"}
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="mt-0.5">•</span>
                <span>
                  {t("profile.deleteAccount.noRecovery") ||
                    "You will not be able to recover your account or data"}
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              {t("profile.deleteAccount.goBack") || "Go Back"}
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isProcessing}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isProcessing
                ? t("profile.deleteAccount.deleting") || "Deleting..."
                : t("profile.deleteAccount.confirm") || "Delete My Account"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountModal;
