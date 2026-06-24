import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Home, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckoutData } from "@/components/CheckoutFlow";

interface AddressStepProps {
  data: CheckoutData;
  onUpdate: (data: Partial<CheckoutData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const { t } = useLanguage();
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  // Mock user addresses
  const savedAddresses = [
    {
      id: '1',
      label: 'Home',
      address: '123 Main St, New York, NY 10001',
      isDefault: true
    },
    {
      id: '2',
      label: 'Work',
      address: '456 Business Ave, New York, NY 10002',
      isDefault: false
    }
  ];

  useEffect(() => {
    // Set default address if available
    const defaultAddress = savedAddresses.find(addr => addr.isDefault);
    if (defaultAddress && !selectedAddress) {
      setSelectedAddress(defaultAddress.address);
      onUpdate({ address: defaultAddress.address });
    }
  }, []);

  const handleAddressSelect = (address: string) => {
    setSelectedAddress(address);
    onUpdate({ address });
    setShowNewAddressForm(false);
  };

  const handleNewAddressSubmit = () => {
    const fullAddress = `${newAddress.street}, ${newAddress.city}, ${newAddress.state} ${newAddress.zipCode}`;
    setSelectedAddress(fullAddress);
    onUpdate({ address: fullAddress });
    setShowNewAddressForm(false);
  };

  const handleContinue = () => {
    if (data.address || selectedAddress) {
      onNext();
    }
  };

  // Show store selection for pickup instead of address
  if (data.deliveryMethod === 'pickup') {
    const storeLocations = {
      walmart: [
        { id: '1', name: 'Walmart Supercenter', address: '123 Store St, New York, NY', distance: '2.1 miles' },
        { id: '2', name: 'Walmart Neighborhood Market', address: '456 Market Ave, Brooklyn, NY', distance: '3.5 miles' }
      ],
      target: [
        { id: '1', name: 'Target Store', address: '789 Target Blvd, Manhattan, NY', distance: '1.8 miles' },
        { id: '2', name: 'Target Express', address: '321 Express Way, Queens, NY', distance: '4.2 miles' }
      ]
    };

    const locations = data.store ? storeLocations[data.store] : [];

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">
              {t('checkout.address.pickup.title')}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t('checkout.address.pickup.subtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {locations.map((location) => (
            <Card 
              key={location.id}
              className={`cursor-pointer transition-colors ${
                selectedAddress === location.address 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => handleAddressSelect(location.address)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {location.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {location.address}
                    </p>
                    <p className="text-sm text-primary mt-1">
                      {location.distance}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button 
          className="w-full h-12" 
          onClick={handleContinue}
          disabled={!selectedAddress}
        >
          {t('common.continue')}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">
            {t('checkout.address.delivery.title')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('checkout.address.delivery.subtitle')}
          </p>
        </div>
      </div>

      {!showNewAddressForm ? (
        <>
          <div className="space-y-3">
            {savedAddresses.map((address) => (
              <Card 
                key={address.id}
                className={`cursor-pointer transition-colors ${
                  selectedAddress === address.address 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleAddressSelect(address.address)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Home className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {address.label}
                        </h3>
                        {address.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {t('checkout.address.default')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.address}
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
            disabled={!selectedAddress}
          >
            {t('common.continue')}
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="street">{t('checkout.address.form.street')}</Label>
              <Input
                id="street"
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city">{t('checkout.address.form.city')}</Label>
                <Input
                  id="city"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  placeholder="New York"
                />
              </div>
              <div>
                <Label htmlFor="state">{t('checkout.address.form.state')}</Label>
                <Input
                  id="state"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  placeholder="NY"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="zipCode">{t('checkout.address.form.zipCode')}</Label>
                <Input
                  id="zipCode"
                  value={newAddress.zipCode}
                  onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                  placeholder="10001"
                />
              </div>
              <div>
                <Label htmlFor="country">{t('checkout.address.form.country')}</Label>
                <Input
                  id="country"
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                  placeholder="USA"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowNewAddressForm(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="flex-1"
              onClick={handleNewAddressSubmit}
              disabled={!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode}
            >
              {t('checkout.address.form.save')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};