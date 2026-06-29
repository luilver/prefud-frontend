
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreditCard, MapPin, ShoppingCart, Plus, Check, Clock, Package } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface OrderOnlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  mealPlanName: string;
}

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  name: string;
}

const OrderOnlineModal = ({ isOpen, onClose, items, mealPlanName }: OrderOnlineModalProps) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("items");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Mock data - in real app, this would come from user context
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
      name: 'Default Card'
    },
    {
      id: '2',
      type: 'paypal',
      isDefault: false,
      name: 'PayPal Account'
    }
  ]);
  
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      name: 'Home',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      isDefault: true
    }
  ]);

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });

  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const totalAmount = items.reduce((total, item) => total + (item.estimatedPrice || 0), 0);
  const deliveryFee = 5.99;
  const finalTotal = totalAmount + deliveryFee;

  const handleAddPaymentMethod = () => {
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      brand: 'visa',
      last4: newPaymentMethod.cardNumber.slice(-4),
      expiryMonth: parseInt(newPaymentMethod.expiryDate.split('/')[0]),
      expiryYear: parseInt('20' + newPaymentMethod.expiryDate.split('/')[1]),
      isDefault: paymentMethods.length === 0,
      name: newPaymentMethod.name || 'New Card'
    };
    
    setPaymentMethods(prev => [...prev, newMethod]);
    setSelectedPaymentMethod(newMethod.id);
    setShowAddPayment(false);
    setNewPaymentMethod({ cardNumber: '', expiryDate: '', cvv: '', name: '' });
  };

  const handleAddAddress = () => {
    const newAddr: Address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: addresses.length === 0
    };
    
    setAddresses(prev => [...prev, newAddr]);
    setSelectedAddress(newAddr.id);
    setShowAddAddress(false);
    setNewAddress({ name: '', street: '', city: '', state: '', zipCode: '' });
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod || !selectedAddress) {
      alert('Please select payment method and delivery address');
      return;
    }

    setIsProcessing(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setOrderPlaced(true);
    
    // Close modal after 3 seconds
    setTimeout(() => {
      setOrderPlaced(false);
      onClose();
    }, 3000);
  };

  const canProceed = selectedPaymentMethod && selectedAddress && !isProcessing;

  if (orderPlaced) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h2>
            <p className="text-gray-600 mb-4">
              Your grocery order from {mealPlanName} has been successfully placed.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Estimated delivery: 2-4 hours
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90dvh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Order Groceries Online
          </DialogTitle>
          <DialogDescription>
            Complete your order for ingredients from {mealPlanName}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="items">
              <Package className="w-4 h-4 mr-2" />
              Items ({items.length})
            </TabsTrigger>
            <TabsTrigger value="address">
              <MapPin className="w-4 w-4 mr-2" />
              Address
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="w-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="review">
              <Check className="w-4 w-4 mr-2" />
              Review
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden mt-4">
            <TabsContent value="items" className="space-y-4 h-full">
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid gap-3">
                  {items.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{item.name}</h4>
                            {item.mealName && (
                              <Badge variant="outline" className="text-xs">
                                {item.mealName}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.unit}
                            {item.notes && ` • ${item.notes}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            ${(item.estimatedPrice || 0).toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex justify-end pt-4">
                <Button onClick={() => setActiveTab("address")}>
                  Continue to Address
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Delivery Address</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowAddAddress(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Address
                </Button>
              </div>

              {showAddAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="address-name">Address Name</Label>
                        <Input
                          id="address-name"
                          placeholder="Home, Work, etc."
                          value={newAddress.name}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          placeholder="123 Main St"
                          value={newAddress.street}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="NY"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          placeholder="10001"
                          value={newAddress.zipCode}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddAddress}>Add Address</Button>
                      <Button variant="outline" onClick={() => setShowAddAddress(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-3">
                {addresses.map((address) => (
                  <Card
                    key={address.id}
                    className={`cursor-pointer transition-all ${
                      selectedAddress === address.id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedAddress(address.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{address.name}</h4>
                            {address.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.street}, {address.city}, {address.state} {address.zipCode}
                          </p>
                        </div>
                        {selectedAddress === address.id && (
                          <Check className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("items")}>
                  Back to Items
                </Button>
                <Button
                  onClick={() => setActiveTab("payment")}
                  disabled={!selectedAddress}
                >
                  Continue to Payment
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Payment Method</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowAddPayment(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Payment Method
                </Button>
              </div>

              {showAddPayment && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="card-name">Cardholder Name</Label>
                        <Input
                          id="card-name"
                          placeholder="John Doe"
                          value={newPaymentMethod.name}
                          onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={newPaymentMethod.cardNumber}
                          onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={newPaymentMethod.expiryDate}
                          onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={newPaymentMethod.cvv}
                          onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddPaymentMethod}>Add Payment Method</Button>
                      <Button variant="outline" onClick={() => setShowAddPayment(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-8 h-8 text-gray-400" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">
                                {method.type === 'card' 
                                  ? `**** **** **** ${method.last4}`
                                  : method.name
                                }
                              </h4>
                              {method.isDefault && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </div>
                            {method.type === 'card' && (
                              <p className="text-sm text-gray-600">
                                {method.brand?.toUpperCase()} • Expires {method.expiryMonth}/{method.expiryYear}
                              </p>
                            )}
                          </div>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <Check className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("address")}>
                  Back to Address
                </Button>
                <Button
                  onClick={() => setActiveTab("review")}
                  disabled={!selectedPaymentMethod}
                >
                  Review Order
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-4">
              <h3 className="text-lg font-semibold">Order Summary</h3>
              
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        <span>${(item.estimatedPrice || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Delivery Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedAddress && (() => {
                      const address = addresses.find(a => a.id === selectedAddress);
                      return address ? (
                        <p className="text-sm">
                          {address.name}<br />
                          {address.street}<br />
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPaymentMethod && (() => {
                      const method = paymentMethods.find(m => m.id === selectedPaymentMethod);
                      return method ? (
                        <p className="text-sm">
                          {method.type === 'card' 
                            ? `${method.brand?.toUpperCase()} **** **** **** ${method.last4}`
                            : method.name
                          }
                        </p>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>${deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span>${finalTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("payment")}>
                  Back to Payment
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={!canProceed}
                  className="min-w-32"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `Place Order • $${finalTotal.toFixed(2)}`
                  )}
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default OrderOnlineModal;
