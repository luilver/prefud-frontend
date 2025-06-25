
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Plus, Check, Store, Truck, MapPin, CreditCard, Calendar, Clock } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  estimated_price: number;
  checked: boolean;
}

interface Store {
  id: string;
  name: string;
  logo: string;
  delivery_available: boolean;
  delivery_fee: number;
  min_order: number;
}

const ShoppingList = () => {
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([
    {
      id: "1",
      name: "Chicken Breast",
      quantity: 2,
      unit: "lbs",
      category: "Meat",
      estimated_price: 8.99,
      checked: false
    },
    {
      id: "2",
      name: "Greek Yogurt",
      quantity: 2,
      unit: "containers",
      category: "Dairy",
      estimated_price: 6.98,
      checked: false
    },
    {
      id: "3",
      name: "Bananas",
      quantity: 1,
      unit: "bunch",
      category: "Fruits",
      estimated_price: 2.49,
      checked: true
    },
    {
      id: "4",
      name: "Brown Rice",
      quantity: 1,
      unit: "bag",
      category: "Grains",
      estimated_price: 3.99,
      checked: false
    },
    {
      id: "5",
      name: "Spinach",
      quantity: 1,
      unit: "bag",
      category: "Vegetables",
      estimated_price: 3.49,
      checked: false
    }
  ]);

  const [stores] = useState<Store[]>([
    {
      id: "1",
      name: "Walmart",
      logo: "🏪",
      delivery_available: true,
      delivery_fee: 7.95,
      min_order: 35
    },
    {
      id: "2",
      name: "Smith's",
      logo: "🛒",
      delivery_available: true,
      delivery_fee: 9.95,
      min_order: 50
    },
    {
      id: "3",
      name: "Kroger",
      logo: "🏬",
      delivery_available: true,
      delivery_fee: 8.95,
      min_order: 40
    }
  ]);

  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState("piece");
  const [newItemCategory, setNewItemCategory] = useState("Other");
  const [deliveryAddress, setDeliveryAddress] = useState("123 Main St, Anytown, USA");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showDeliveryFlow, setShowDeliveryFlow] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState("asap");
  const [showAddToPantryDialog, setShowAddToPantryDialog] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);

  const { addIngredient } = useUser();
  const { toast } = useToast();

  const categories = ["Meat", "Dairy", "Fruits", "Vegetables", "Grains", "Other"];
  const units = ["piece", "lbs", "kg", "containers", "bunch", "bag", "bottle", "box"];

  const toggleItem = (id: string) => {
    setShoppingItems(items =>
      items.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const addItem = () => {
    if (newItemName.trim()) {
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name: newItemName,
        quantity: newItemQuantity,
        unit: newItemUnit,
        category: newItemCategory,
        estimated_price: 2.99,
        checked: false
      };
      setShoppingItems([...shoppingItems, newItem]);
      setNewItemName("");
      setNewItemQuantity(1);
      setNewItemUnit("piece");
      setNewItemCategory("Other");
      setShowAddItemDialog(false);
      
      toast({
        title: "Item Added",
        description: `${newItem.name} has been added to your shopping list.`,
      });
    }
  };

  const addItemToPantry = (item: ShoppingItem) => {
    const ingredient = {
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week expiry
      purchaseDate: new Date(), // Add missing purchaseDate
      location: "Pantry"
    };
    
    addIngredient(ingredient);
    
    toast({
      title: "Added to Pantry",
      description: `${item.name} has been added to your pantry.`,
    });
  };

  const removeItem = (id: string) => {
    setShoppingItems(items => items.filter(item => item.id !== id));
  };

  const handleDeliveryCheckout = () => {
    if (!selectedStore) {
      toast({
        title: "Please select a store",
        description: "Choose a store for delivery before proceeding.",
        variant: "destructive"
      });
      return;
    }

    const total = totalEstimated + selectedStore.delivery_fee;
    
    if (totalEstimated < selectedStore.min_order) {
      toast({
        title: "Minimum order not met",
        description: `Minimum order for ${selectedStore.name} is $${selectedStore.min_order}`,
        variant: "destructive"
      });
      return;
    }

    console.log("Processing delivery order:", {
      store: selectedStore,
      items: shoppingItems,
      address: deliveryAddress,
      deliveryTime,
      total
    });

    toast({
      title: "Order Placed Successfully!",
      description: `Your order from ${selectedStore.name} has been placed. Estimated delivery: ${deliveryTime === 'asap' ? '1-2 hours' : deliveryTime}`,
    });

    // Reset the shopping list
    setShoppingItems([]);
    setShowDeliveryFlow(false);
    setSelectedStore(null);
  };

  const handleAddToPantry = () => {
    const uncheckedItems = shoppingItems.filter(item => !item.checked);
    
    uncheckedItems.forEach(item => {
      const ingredient = {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week expiry
        purchaseDate: new Date(), // Add missing purchaseDate
        location: "Pantry"
      };
      addIngredient(ingredient);
    });

    toast({
      title: "Items Added to Pantry",
      description: `${uncheckedItems.length} items have been added to your pantry with default expiry dates.`,
    });

    setShowAddToPantryDialog(false);
    setShoppingItems([]);
  };

  const totalEstimated = shoppingItems.reduce((sum, item) => sum + item.estimated_price, 0);
  const checkedItems = shoppingItems.filter(item => item.checked);
  const uncheckedItems = shoppingItems.filter(item => !item.checked);

  const categorizedItems = uncheckedItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Meat': '🥩',
      'Dairy': '🥛',
      'Fruits': '🍎',
      'Vegetables': '🥕',
      'Grains': '🌾',
      'Other': '📦'
    };
    return icons[category] || '📦';
  };

  if (showDeliveryFlow) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setShowDeliveryFlow(false)}>
            ← Back to Shopping List
          </Button>
          <h2 className="text-2xl font-bold text-gray-800">Complete Your Delivery Order</h2>
          <div></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Store Selection */}
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="h-5 w-5 text-green-600" />
                <span>Select Store</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stores.map((store) => (
                  <div 
                    key={store.id} 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStore?.id === store.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-green-200 hover:bg-green-50'
                    }`}
                    onClick={() => setSelectedStore(store)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{store.logo}</span>
                        <div>
                          <h4 className="font-medium text-gray-800">{store.name}</h4>
                          <p className="text-sm text-gray-600">
                            Delivery: ${store.delivery_fee} • Min: ${store.min_order}
                          </p>
                        </div>
                      </div>
                      {selectedStore?.id === store.id && (
                        <Check className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Details */}
          <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-blue-600" />
                <span>Delivery Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Delivery Address</Label>
                <Input
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
              
              <div>
                <Label htmlFor="delivery-time">Delivery Time</Label>
                <select 
                  id="delivery-time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full p-2 border border-blue-200 rounded-md focus:border-blue-400 focus:outline-none"
                >
                  <option value="asap">ASAP (1-2 hours)</option>
                  <option value="morning">Tomorrow Morning (8-12 PM)</option>
                  <option value="afternoon">Tomorrow Afternoon (12-6 PM)</option>
                  <option value="evening">Tomorrow Evening (6-10 PM)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {deliveryTime === 'asap' ? 'Delivery in 1-2 hours' : `Delivery ${deliveryTime}`}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-700">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {shoppingItems.slice(0, 3).map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} ({item.quantity})</span>
                      <span>${item.estimated_price.toFixed(2)}</span>
                    </div>
                  ))}
                  {shoppingItems.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{shoppingItems.length - 3} more items
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${totalEstimated.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>${selectedStore?.delivery_fee.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>${(totalEstimated * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${((totalEstimated + (selectedStore?.delivery_fee || 0)) * 1.08).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {selectedStore && totalEstimated < selectedStore.min_order && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    Add ${(selectedStore.min_order - totalEstimated).toFixed(2)} more to reach minimum order
                  </div>
                )}

                <Button 
                  onClick={handleDeliveryCheckout}
                  className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                  disabled={!selectedStore || totalEstimated < (selectedStore?.min_order || 0)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Place Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Shopping List</h2>
          <p className="text-gray-600">Manage your grocery shopping and delivery</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={showAddToPantryDialog} onOpenChange={setShowAddToPantryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
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
                  This will add all unchecked items from your shopping list to your pantry with default expiry dates.
                </p>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm font-medium mb-2">Items to add: {uncheckedItems.length}</p>
                  <div className="text-sm text-gray-600">
                    {uncheckedItems.slice(0, 3).map(item => item.name).join(', ')}
                    {uncheckedItems.length > 3 && ` +${uncheckedItems.length - 3} more`}
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
          <Button 
            onClick={() => setShowDeliveryFlow(true)}
            className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
          >
            <Truck className="h-4 w-4 mr-2" />
            Get Delivery
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Shopping List */}
        <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                <span>Shopping List</span>
              </div>
              <span className="text-sm text-gray-500">
                {checkedItems.length}/{shoppingItems.length} completed
              </span>
            </CardTitle>
            <CardDescription>
              Your grocery list organized by category
            </CardDescription>
            
            {/* Add New Item */}
            <div className="flex space-x-2">
              <Input
                placeholder="Add new item..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
                className="border-green-200 focus:border-green-400"
              />
              <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-green-500 hover:bg-green-600">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="item-name">Item Name</Label>
                      <Input
                        id="item-name"
                        placeholder="e.g., Chicken Breast"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="item-quantity">Quantity</Label>
                        <Input
                          id="item-quantity"
                          type="number"
                          min="1"
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="item-unit">Unit</Label>
                        <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map(unit => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="item-category">Category</Label>
                      <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button onClick={addItem} className="flex-1">
                        Add Item
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddItemDialog(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Unchecked Items by Category */}
              {Object.entries(categorizedItems).map(([category, items]) => (
                <div key={category}>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <span>{category}</span>
                    <span className="text-sm text-gray-500">({items.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-green-100">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="w-5 h-5 rounded border-2 border-green-300 flex items-center justify-center hover:bg-green-50 transition-colors"
                          >
                            {item.checked && <Check className="h-3 w-3 text-green-600" />}
                          </button>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{item.name}</h4>
                            <p className="text-sm text-gray-600">
                              {item.quantity} {item.unit}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700">
                            ${item.estimated_price.toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addItemToPantry(item)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Add to Pantry"
                          >
                            <Store className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Checked Items */}
              {checkedItems.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-500 mb-3 flex items-center space-x-2">
                    <Check className="h-4 w-4" />
                    <span>Completed ({checkedItems.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {checkedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-75">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="w-5 h-5 rounded border-2 border-green-500 bg-green-500 flex items-center justify-center"
                          >
                            <Check className="h-3 w-3 text-white" />
                          </button>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-600 line-through">{item.name}</h4>
                            <p className="text-sm text-gray-500">
                              {item.quantity} {item.unit}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          ${item.estimated_price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {shoppingItems.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Your shopping list is empty</p>
                  <p className="text-sm">Add items to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Store Selection & Summary */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="bg-white/70 backdrop-blur-sm border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-700">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({shoppingItems.length})</span>
                  <span className="font-medium">${totalEstimated.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Tax</span>
                  <span className="font-medium">${(totalEstimated * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Estimated Total</span>
                    <span>${(totalEstimated * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-700">
                <MapPin className="h-5 w-5" />
                <span>Delivery Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="border-blue-200 focus:border-blue-400"
                />
                <Button variant="outline" size="sm" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                  Update Address
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-700">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => setShowAddToPantryDialog(true)}
                variant="outline" 
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                disabled={uncheckedItems.length === 0}
              >
                <Store className="h-4 w-4 mr-2" />
                Add All to Pantry
              </Button>
              <Button 
                onClick={() => setShowDeliveryFlow(true)}
                className="w-full bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
                disabled={shoppingItems.length === 0}
              >
                <Truck className="h-4 w-4 mr-2" />
                Order for Delivery
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
