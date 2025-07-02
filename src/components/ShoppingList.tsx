import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Plus, Trash2, Check, Package, Store, CheckSquare, ArrowLeft, CalendarDays, CreditCard, MapPin } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

const ShoppingList = () => {
  const { 
    shoppingItems, 
    addShoppingItem, 
    updateShoppingItem, 
    deleteShoppingItem, 
    toggleShoppingItemPurchased,
    mealPlans,
    addPantryItem,
    paymentMethods,
    addPaymentMethod,
    getPaymentMethods
  } = useUser();
  
  const { toast } = useToast();
  
  const [selectedMealPlan, setSelectedMealPlan] = useState<any>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showAddToPantryDialog, setShowAddToPantryDialog] = useState(false);
  const [showOrderOnlineDialog, setShowOrderOnlineDialog] = useState(false);
  
  // Payment and address states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  // Load payment methods when dialog opens
  const handleOrderDialogOpen = (open: boolean) => {
    if (open) {
      getPaymentMethods();
    }
    setShowOrderOnlineDialog(open);
  };

  const handleItemCheck = (itemId: string, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const handleSelectAll = () => {
    const currentList = selectedMealPlan ? selectedMealPlan.shoppingList : shoppingItems;
    if (!currentList || currentList.length === 0) return;
    
    const allChecked = currentList.every((item: any) => checkedItems[item.id]);
    const newCheckedItems: Record<string, boolean> = {};
    
    if (!allChecked) {
      // Select all items
      currentList.forEach((item: any) => {
        newCheckedItems[item.id] = true;
      });
    }
    // If all are checked, uncheck all (empty object)
    
    setCheckedItems(newCheckedItems);
  };

  const handleAddToPantry = () => {
    const currentList = selectedMealPlan ? selectedMealPlan.shoppingList : shoppingItems;
    const checkedItemNames = Object.entries(checkedItems)
      .filter(([_, isChecked]) => isChecked)
      .map(([itemId, _]) => {
        const item = currentList?.find((item: any) => item.id === itemId);
        return item?.name;
      })
      .filter(Boolean);

    if (checkedItemNames.length > 0) {
      checkedItemNames.forEach(itemName => {
        addPantryItem({
          name: itemName,
          quantity: 1,
          unit: 'item',
          category: 'meal-ingredient',
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          purchaseDate: new Date(),
          notes: selectedMealPlan ? `Added from meal plan: ${selectedMealPlan.name}` : 'Added from shopping list'
        });
      });
      // Reset checkboxes after adding to pantry
      setCheckedItems({});
      setShowAddToPantryDialog(false);
      toast({
        title: "Items Added to Pantry",
        description: `${checkedItemNames.length} items have been successfully added to your pantry!`,
      });
    } else {
      toast({
        title: "No Items Selected",
        description: "Please select items to add to your pantry.",
        variant: "destructive",
      });
    }
  };

  const validateDeliveryAddress = () => {
    return deliveryAddress.street && deliveryAddress.city && deliveryAddress.state && deliveryAddress.zipCode;
  };

  const validateNewPaymentMethod = () => {
    return newPaymentMethod.cardNumber && newPaymentMethod.expiryDate && newPaymentMethod.cvv && newPaymentMethod.cardholderName;
  };

  const handleAddNewPaymentMethod = async () => {
    if (!validateNewPaymentMethod()) {
      toast({
        title: "Invalid Payment Method",
        description: "Please fill in all payment method fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addPaymentMethod(newPaymentMethod);
      setShowAddPaymentMethod(false);
      setNewPaymentMethod({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });
      toast({
        title: "Payment Method Added",
        description: "Your new payment method has been added successfully.",
      });
      // Refresh payment methods and select the new one
      await getPaymentMethods();
      const newMethodId = paymentMethods[paymentMethods.length - 1]?.id;
      if (newMethodId) {
        setSelectedPaymentMethod(newMethodId);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOrderOnline = () => {
    const currentList = selectedMealPlan ? selectedMealPlan.shoppingList : shoppingItems;
    const checkedItemNames = Object.entries(checkedItems)
      .filter(([_, isChecked]) => isChecked)
      .map(([itemId, _]) => {
        const item = currentList?.find((item: any) => item.id === itemId);
        return item?.name;
      })
      .filter(Boolean);

    if (checkedItemNames.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items to order online.",
        variant: "destructive",
      });
      return;
    }

    if (!validateDeliveryAddress()) {
      toast({
        title: "Address Required",
        description: "Please fill in all delivery address fields.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPaymentMethod && !showAddPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method or add a new one.",
        variant: "destructive",
      });
      return;
    }

    // Get selected payment method details
    const paymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
    const paymentDisplay = paymentMethod ? `****${paymentMethod.last4}` : 'New card';

    // Simulate order processing
    toast({
      title: "Order Placed Successfully! 🎉",
      description: `${checkedItemNames.length} items ordered with ${paymentDisplay}. Delivery to ${deliveryAddress.street}, ${deliveryAddress.city}.`,
    });
    
    // Reset form and close dialog
    setCheckedItems({});
    setShowOrderOnlineDialog(false);
    setSelectedPaymentMethod("");
    setDeliveryAddress({ street: '', city: '', state: '', zipCode: '', country: '' });
    setShowAddPaymentMethod(false);
  };

  const currentShoppingList = selectedMealPlan ? selectedMealPlan.shoppingList : shoppingItems;
  const uncheckedItems = currentShoppingList?.filter((item: any) => !checkedItems[item.id]) || [];

  // If a meal plan is selected, show its shopping list
  if (selectedMealPlan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedMealPlan(null)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Shopping Lists
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Shopping List - {selectedMealPlan.name}</h2>
          <div className="flex gap-2">
            <Dialog open={showAddToPantryDialog} onOpenChange={setShowAddToPantryDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Shop In-Store
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Items to Pantry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    This will add all selected items from your shopping list to your pantry with default expiry dates.
                  </p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium mb-2">Items to add: {Object.keys(checkedItems).filter(key => checkedItems[key]).length}</p>
                    <div className="text-sm text-gray-600">
                      {Object.entries(checkedItems)
                        .filter(([_, isChecked]) => isChecked)
                        .slice(0, 3)
                        .map(([itemId, _]) => {
                          const item = selectedMealPlan.shoppingList?.find((item: any) => item.id === itemId);
                          return item?.name;
                        })
                        .filter(Boolean)
                        .join(', ')}
                      {Object.keys(checkedItems).filter(key => checkedItems[key]).length > 3 && 
                        ` +${Object.keys(checkedItems).filter(key => checkedItems[key]).length - 3} more`}
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleAddToPantry}
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      Add to Pantry
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddToPantryDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showOrderOnlineDialog} onOpenChange={handleOrderDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Order Online
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Complete Your Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Selected Items */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Selected Items ({Object.keys(checkedItems).filter(key => checkedItems[key]).length})</h3>
                    <div className="text-sm text-gray-600">
                      {Object.entries(checkedItems)
                        .filter(([_, isChecked]) => isChecked)
                        .map(([itemId, _]) => {
                          const item = selectedMealPlan.shoppingList?.find((item: any) => item.id === itemId);
                          return item?.name;
                        })
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  </div>

                  {/* Payment Method Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payment Method
                      </h3>
                      {paymentMethods.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddPaymentMethod(!showAddPaymentMethod)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add New
                        </Button>
                      )}
                    </div>

                    {paymentMethods.length > 0 && !showAddPaymentMethod ? (
                      <div>
                        <Label htmlFor="payment-method">Select Payment Method</Label>
                        <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a payment method..." />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.id} value={method.id}>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  <span className="capitalize">{method.brand}</span>
                                  <span>****{method.last4}</span>
                                  {method.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-sm">Add New Payment Method</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <Label htmlFor="cardholderName">Cardholder Name</Label>
                            <Input
                              id="cardholderName"
                              value={newPaymentMethod.cardholderName}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardholderName: e.target.value }))}
                              placeholder="John Doe"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                              id="cardNumber"
                              value={newPaymentMethod.cardNumber}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>
                          <div>
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                              id="expiryDate"
                              value={newPaymentMethod.expiryDate}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryDate: e.target.value }))}
                              placeholder="MM/YY"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              value={newPaymentMethod.cvv}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                              placeholder="123"
                            />
                          </div>
                        </div>
                        {paymentMethods.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddPaymentMethod(false)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Address
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          value={deliveryAddress.street}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={deliveryAddress.state}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="NY"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={deliveryAddress.zipCode}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                          placeholder="10001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={deliveryAddress.country}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="United States"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      onClick={showAddPaymentMethod && paymentMethods.length === 0 ? handleAddNewPaymentMethod : handleOrderOnline}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      {showAddPaymentMethod && paymentMethods.length === 0 ? 'Add Payment & Place Order' : 'Place Order'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowOrderOnlineDialog(false);
                        setSelectedPaymentMethod("");
                        setDeliveryAddress({ street: '', city: '', state: '', zipCode: '', country: '' });
                        setShowAddPaymentMethod(false);
                        setNewPaymentMethod({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  Shopping List ({(selectedMealPlan.shoppingList || []).length} items)
                </CardTitle>
                <CardDescription>
                  Select ingredients to add to pantry or order online
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                {(selectedMealPlan.shoppingList || []).every((item: any) => checkedItems[item.id]) ? 'Unselect All' : 'Select All'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(selectedMealPlan.shoppingList || []).map((item: any) => (
                <div key={item.id} className="flex items-center space-x-3 p-4 bg-white/80 rounded-lg border border-green-100 hover:bg-white/90 transition-colors">
                  <Checkbox
                    id={item.id}
                    checked={checkedItems[item.id] || false}
                    onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          From: {item.mealName || 'Various meals'} • Qty: {item.quantity} {item.unit}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {(selectedMealPlan.shoppingList || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No shopping list generated yet</p>
                <p className="text-sm">Go back to the meal plan and generate a shopping list</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Shopping Lists</h2>
          <p className="text-gray-600">Manage your shopping lists from meal plans</p>
        </div>
        <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Meal Plans Shopping Lists */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-purple-600" />
            <span>Meal Plan Shopping Lists</span>
          </CardTitle>
          <CardDescription>
            Select a meal plan to view and manage its shopping list
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mealPlans.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mealPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className="border-purple-100 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105 bg-white/80 hover:bg-white/90"
                  onClick={() => setSelectedMealPlan(plan)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-gray-800">{plan.name}</CardTitle>
                    <div className="text-sm text-gray-500 font-medium">
                      {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-purple-600 font-semibold">
                      Shopping list: {(plan.shoppingList || []).length} items
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      View Shopping List
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No meal plans available</p>
              <p className="text-sm">Create a meal plan to generate shopping lists</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regular Shopping List */}
      <Card className="bg-white/70 backdrop-blur-sm border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                Personal Shopping List ({shoppingItems.length} items)
              </CardTitle>
              <CardDescription>
                Your personal shopping items
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              {shoppingItems.every((item: any) => checkedItems[item.id]) ? 'Unselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shoppingItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                  item.purchased
                    ? "bg-green-50 border-green-200"
                    : "bg-white/80 border-green-100 hover:bg-white/90"
                }`}
              >
                <Checkbox
                  checked={item.purchased}
                  onCheckedChange={() => toggleShoppingItemPurchased(item.id)}
                  className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium ${item.purchased ? "line-through text-gray-500" : "text-gray-800"}`}>
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {item.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteShoppingItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {shoppingItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your shopping list is empty</p>
              <p className="text-sm">Add items to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShoppingList;
