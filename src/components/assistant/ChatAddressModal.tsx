import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { createUserAddress, UserAddress, CreateAddressPayload } from "@/services/addressService";
import { toast } from "@/hooks/use-toast";

interface ChatAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (address: UserAddress) => void;
  title?: string;
  description?: string;
}

export const ChatAddressModal: React.FC<ChatAddressModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
}) => {
  const { user: authUser } = useAuth();
  const { user } = useUser();
  const { t } = useLanguage();

  const [nickname, setNickname] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [countryCode, setCountryCode] = useState("US");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!line1.trim() || !city.trim() || !state.trim() || !zipcode.trim()) {
      setError(
        t("checkout.address.form.errorRequired") ||
          "Please fill in all required address fields."
      );
      return;
    }

    const userId = authUser?.userId || (authUser as any)?.id || user?.id;
    if (!userId) {
      setError(
        t("assistant.errors.processRequest") ||
          "User session not found. Please log in again."
      );
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const payload: CreateAddressPayload = {
        country_code: countryCode.trim().toUpperCase() || "US",
        zipcode: zipcode.trim(),
        state: state.trim(),
        city: city.trim(),
        line1: line1.trim(),
        ...(line2.trim() ? { line2: line2.trim() } : {}),
        ...(nickname.trim() ? { nickname: nickname.trim() } : {}),
      };

      const createdAddress = await createUserAddress(userId, payload);

      toast({
        title:
          t("assistant.order.addressSuccess") ||
          "Delivery address added successfully!",
        description: t("assistant.chat.orderInProcess") || "Resending order to chat...",
      });

      // Reset form
      setNickname("");
      setLine1("");
      setLine2("");
      setCity("");
      setState("");
      setZipcode("");
      setCountryCode("US");

      onSuccess(createdAddress);
    } catch (err: any) {
      console.error("Error creating user address:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save delivery address. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] max-w-[95vw] p-5 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="p-2 rounded-xl bg-primary/10">
              <MapPin className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">
              {title || t("assistant.order.addAddressTitle") || "Add Delivery Address"}
            </DialogTitle>
          </div>
          {description && (
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          {/* Nickname (optional) */}
          <div className="space-y-1">
            <Label htmlFor="address-nickname" className="text-xs sm:text-sm font-medium">
              {t("assistant.order.nicknameLabel") || "Nickname (optional)"}
            </Label>
            <Input
              id="address-nickname"
              placeholder="Home, Work, Apartment..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {/* Street Line 1 */}
          <div className="space-y-1">
            <Label htmlFor="address-line1" className="text-xs sm:text-sm font-medium">
              {t("assistant.order.addressLine1") || "Street Address"} *
            </Label>
            <Input
              id="address-line1"
              placeholder="123 Main St"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              disabled={isProcessing}
              required
            />
          </div>

          {/* Line 2 (optional) */}
          <div className="space-y-1">
            <Label htmlFor="address-line2" className="text-xs sm:text-sm font-medium">
              {t("assistant.order.addressLine2") || "Apt, Suite, Unit (optional)"}
            </Label>
            <Input
              id="address-line2"
              placeholder="Apt 4B"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="address-city" className="text-xs sm:text-sm font-medium">
                {t("assistant.order.city") || "City"} *
              </Label>
              <Input
                id="address-city"
                placeholder="New York"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isProcessing}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="address-state" className="text-xs sm:text-sm font-medium">
                {t("assistant.order.state") || "State / Province"} *
              </Label>
              <Input
                id="address-state"
                placeholder="NY"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={isProcessing}
                required
              />
            </div>
          </div>

          {/* ZIP Code & Country */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="address-zip" className="text-xs sm:text-sm font-medium">
                {t("assistant.order.zipcode") || "ZIP / Postal Code"} *
              </Label>
              <Input
                id="address-zip"
                placeholder="10001"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                disabled={isProcessing}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="address-country" className="text-xs sm:text-sm font-medium">
                {t("assistant.order.country") || "Country"}
              </Label>
              <Input
                id="address-country"
                placeholder="US"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                disabled={isProcessing}
                maxLength={2}
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {error}
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isProcessing}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground font-semibold shadow-md"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("assistant.order.savingAddress") || "Saving Address..."}
                </>
              ) : (
                t("assistant.order.saveAddressAndRetry") || "Save Address & Proceed"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChatAddressModal;

