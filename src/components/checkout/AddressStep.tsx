import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Home, Plus, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckoutData } from "@/components/CheckoutFlow";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserAddresses,
  createUserAddress,
  UserAddress,
  CreateAddressPayload,
} from "@/services/addressService";

interface AddressStepProps {
  data: CheckoutData;
  onUpdate: (data: Partial<CheckoutData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EMPTY_FORM: CreateAddressPayload = {
  country_code: 'US',
  zipcode: '',
  state: '',
  city: '',
  line1: '',
  line2: '',
  nickname: '',
};

function formatAddressLabel(address: UserAddress): string {
  const parts = [address.line1];
  if (address.line2) parts.push(address.line2);
  parts.push(`${address.city}, ${address.state} ${address.zipcode}`);
  return parts.join(', ');
}

export const AddressStep: React.FC<AddressStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { t } = useLanguage();
  const { user: authUser } = useAuth();

  const userId = authUser?.userId || '';

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<CreateAddressPayload>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchAddresses();
    }
  }, [userId]);

  const fetchAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const result = await getUserAddresses(userId);
      setAddresses(result);

      // Auto-select first address if none chosen
      if (result.length > 0 && !selectedAddressId) {
        setSelectedAddressId(result[0]._id);
        onUpdate({
          address: formatAddressLabel(result[0]),
          selectedAddress: result[0],
        });
      }

      // If no addresses, show the form
      if (result.length === 0) {
        setShowNewAddressForm(true);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleAddressSelect = (address: UserAddress) => {
    setSelectedAddressId(address._id);
    onUpdate({
      address: formatAddressLabel(address),
      selectedAddress: address,
    });
    setShowNewAddressForm(false);
  };

  const handleNewAddressSubmit = async () => {
    if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.zipcode) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const created = await createUserAddress(userId, {
        country_code: newAddress.country_code || 'US',
        zipcode: newAddress.zipcode,
        state: newAddress.state,
        city: newAddress.city,
        line1: newAddress.line1,
        ...(newAddress.line2 ? { line2: newAddress.line2 } : {}),
        ...(newAddress.nickname ? { nickname: newAddress.nickname } : {}),
      });

      // Refresh list and select the new address
      await fetchAddresses();
      setSelectedAddressId(created._id);
      onUpdate({
        address: formatAddressLabel(created),
        selectedAddress: created,
      });
      setShowNewAddressForm(false);
      setNewAddress(EMPTY_FORM);
    } catch (error: any) {
      console.error('Error saving address:', error);
      setSaveError(
        error?.response?.data?.message || 'Failed to save address. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = () => {
    if (data.address || selectedAddressId) {
      onNext();
    }
  };

  // ── Pickup mode: show store locations (unchanged logic) ──
  if (data.deliveryMethod === 'pickup') {
    const storeLocations = {
      walmart: [
        { id: '1', name: 'Walmart Supercenter', address: '123 Store St, New York, NY', distance: '2.1 miles' },
        { id: '2', name: 'Walmart Neighborhood Market', address: '456 Market Ave, Brooklyn, NY', distance: '3.5 miles' },
      ],
      target: [
        { id: '1', name: 'Target Store', address: '789 Target Blvd, Manhattan, NY', distance: '1.8 miles' },
        { id: '2', name: 'Target Express', address: '321 Express Way, Queens, NY', distance: '4.2 miles' },
      ],
    };

    const locations = data.store ? storeLocations[data.store] : [];

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{t('checkout.address.pickup.title')}</h2>
            <p className="text-muted-foreground text-sm">{t('checkout.address.pickup.subtitle')}</p>
          </div>
        </div>

        <div className="space-y-3">
          {locations.map((location) => (
            <Card
              key={location.id}
              className={`cursor-pointer transition-colors ${
                selectedAddressId === location.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => {
                setSelectedAddressId(location.id);
                onUpdate({ address: location.address });
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                    <p className="text-sm text-primary mt-1">{location.distance}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          className="w-full h-12"
          onClick={handleContinue}
          disabled={!selectedAddressId && !data.address}
        >
          {t('common.continue')}
        </Button>
      </div>
    );
  }

  // ── Delivery mode ──
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">{t('checkout.address.delivery.title')}</h2>
          <p className="text-muted-foreground text-sm">{t('checkout.address.delivery.subtitle')}</p>
        </div>
      </div>

      {/* Loading state */}
      {isLoadingAddresses ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground text-sm">Loading addresses...</span>
        </div>
      ) : !showNewAddressForm ? (
        <>
          <div className="space-y-3">
            {addresses.map((address) => (
              <Card
                key={address._id}
                className={`cursor-pointer transition-colors ${
                  selectedAddressId === address._id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleAddressSelect(address)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Home className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {address.nickname || address.line1}
                        </h3>
                        {selectedAddressId === address._id && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {t('checkout.address.default')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatAddressLabel(address)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => setShowNewAddressForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('checkout.address.addNew')}
            </Button>
          </div>

          <Button
            className="w-full h-12"
            onClick={handleContinue}
            disabled={!selectedAddressId && !data.address}
          >
            {t('common.continue')}
          </Button>
        </>
      ) : (
        /* ── Add new address form ── */
        <div className="space-y-4">
          {/* Nickname */}
          <div>
            <Label htmlFor="nickname">
              Nickname <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="nickname"
              value={newAddress.nickname}
              onChange={(e) => setNewAddress({ ...newAddress, nickname: e.target.value })}
              placeholder="Home, Work…"
            />
          </div>

          {/* Line 1 */}
          <div>
            <Label htmlFor="line1">{t('checkout.address.form.street')}</Label>
            <Input
              id="line1"
              value={newAddress.line1}
              onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
              placeholder="123 Main Street"
            />
          </div>

          {/* Line 2 */}
          <div>
            <Label htmlFor="line2">
              Apt / Suite <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="line2"
              value={newAddress.line2}
              onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
              placeholder="Apt 4B"
            />
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city">{t('checkout.address.form.city')}</Label>
              <Input
                id="city"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                placeholder="Los Angeles"
              />
            </div>
            <div>
              <Label htmlFor="state">{t('checkout.address.form.state')}</Label>
              <Input
                id="state"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                placeholder="California"
              />
            </div>
          </div>

          {/* Zip + Country */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="zipcode">{t('checkout.address.form.zipCode')}</Label>
              <Input
                id="zipcode"
                value={newAddress.zipcode}
                onChange={(e) => setNewAddress({ ...newAddress, zipcode: e.target.value })}
                placeholder="12345"
                maxLength={10}
              />
            </div>
            <div>
              <Label htmlFor="country_code">{t('checkout.address.form.country')}</Label>
              <Input
                id="country_code"
                value={newAddress.country_code}
                onChange={(e) => setNewAddress({ ...newAddress, country_code: e.target.value.toUpperCase() })}
                placeholder="US"
                maxLength={2}
              />
            </div>
          </div>

          {/* Error */}
          {saveError && (
            <p className="text-sm text-destructive">{saveError}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSaveError(null);
                if (addresses.length > 0) {
                  setShowNewAddressForm(false);
                }
              }}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="flex-1"
              onClick={handleNewAddressSubmit}
              disabled={
                isSaving ||
                !newAddress.line1 ||
                !newAddress.city ||
                !newAddress.state ||
                !newAddress.zipcode
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                t('checkout.address.form.save')
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};