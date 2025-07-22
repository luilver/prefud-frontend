import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Users, ChefHat, ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight, Package, CheckCircle, Plus, Store, CheckSquare, Truck, CreditCard, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import RecipeView from "./RecipeView";

interface MealPlanViewProps {
  plan: any;
  onBack: () => void;
  onEdit: () => void;
  onSelectMeal?: (meal: any) => void;
  onGenerateShoppingList?: (meals: any[]) => void;
  onAddToPantry?: (items: string[]) => void;
}

const MealPlanView = ({ plan, onBack, onEdit, onSelectMeal, onGenerateShoppingList, onAddToPantry }: MealPlanViewProps) => {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showAddToPantryDialog, setShowAddToPantryDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Get user context for payment methods and pantry updates
  const { paymentMethods, addPaymentMethod, getPaymentMethods, addIngredient, updatePantryFromIngredients } = useUser();
  
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

  if (!plan) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No meal plan selected</p>
      </div>
    );
  }

  // Show recipe view if a meal is selected
  if (selectedMeal) {
    return (
      <RecipeView 
        meal={selectedMeal} 
        onBack={() => setSelectedMeal(null)}
      />
    );
  }

  const meals = plan.meals || [];
  const weekMeals = meals.filter((meal: any) => meal.week === currentWeek);
  
  // Group meals by day  
  const mealsByDay = weekMeals.reduce((acc: any, meal: any) => {
    if (!acc[meal.day]) {
      acc[meal.day] = [];
    }
    acc[meal.day].push(meal);
    return acc;
  }, {});

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleMealClick = (meal: any) => {
    setSelectedMeal(meal);
    if (onSelectMeal) {
      onSelectMeal(meal);
    }
  };

  const toggleMealCompletion = (meal: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent meal click when checking completion
    const mealId = meal.id;
    const isCompleted = !completedMeals[mealId];
    
    setCompletedMeals(prev => ({
      ...prev,
      [mealId]: isCompleted
    }));
    
    if (isCompleted && meal.calories) {
      // Add meal nutritional information to calorie tracker
      const mealNutrition = {
        id: `meal-${mealId}-${Date.now()}`,
        name: meal.name,
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fat: meal.fat || 0,
        quantity: 1,
        unit: "serving"
      };
      
      // Here you would typically call a function to add to calorie tracker
      // For now, we'll just show in the toast
      console.log('Adding meal nutrition to calorie tracker:', mealNutrition);
      
      toast({
        title: "Meal completed! 🎉",
        description: `Great job! Added ${meal.calories || 0} calories, ${meal.protein || 0}g protein, ${meal.carbs || 0}g carbs, ${meal.fat || 0}g fat to your daily intake.`,
      });
    } else if (isCompleted) {
      toast({
        title: "Meal completed! 🎉",
        description: "Great job on cooking this meal!",
      });
    } else {
      toast({
        title: "Meal unchecked",
        description: "Meal marked as not completed",
      });
    }
  };

  const handleGenerateShoppingList = () => {
    console.log('Generating shopping list for plan:', plan.name);
    
    // Generate a mock shopping list if it doesn't exist
    if (!plan.shoppingList || plan.shoppingList.length === 0) {
      const mockShoppingList = meals.flatMap((meal: any, index: number) => 
        (meal.ingredients || []).map((ingredient: string, ingredientIndex: number) => ({
          id: `${meal.id}-${ingredientIndex}`,
          name: ingredient,
          quantity: Math.floor(Math.random() * 3) + 1,
          unit: ['cups', 'lbs', 'oz', 'pieces'][Math.floor(Math.random() * 4)],
          category: ['Protein', 'Vegetables', 'Dairy', 'Grains', 'Spices'][Math.floor(Math.random() * 5)],
          priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          mealName: meal.name
        }))
      );
      plan.shoppingList = mockShoppingList;
    }
    
    if (onGenerateShoppingList) {
      onGenerateShoppingList(meals);
    }
    setShowShoppingList(true);
    toast({
      title: "Shopping list generated!",
      description: `Created shopping list with ${(plan.shoppingList || []).length} items from your meal plan.`,
    });
  };

  const handleItemCheck = (itemId: string, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const handleAddToPantry = () => {
    const checkedItemsData = Object.entries(checkedItems)
      .filter(([_, isChecked]) => isChecked)
      .map(([itemId, _]) => {
        const item = plan.shoppingList?.find((item: any) => item.id === itemId);
        return item;
      })
      .filter(Boolean);

    if (checkedItemsData.length > 0) {
      // Add each item to pantry with proper structure including purchaseDate
      checkedItemsData.forEach((item: any) => {
        const ingredientData = {
          name: item.name,
          quantity: item.quantity || 1,
          unit: item.unit || 'pieces',
          category: item.category || 'Pantry',
          location: 'Pantry',
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          purchaseDate: new Date(), // Add the missing purchaseDate
          addedFromShoppingList: true
        };
        
        console.log('Adding ingredient to pantry:', ingredientData);
        addIngredient(ingredientData);
      });

      // Update pantry from ingredients context with ingredient names
      const ingredientNames = checkedItemsData.map((item: any) => item.name);
      updatePantryFromIngredients(ingredientNames);

      // Reset checkboxes after adding to pantry
      setCheckedItems({});
      setShowAddToPantryDialog(false);
      toast({
        title: "Items added to pantry!",
        description: `Successfully added ${checkedItemsData.length} items to your pantry with default expiry dates.`,
      });
    } else {
      toast({
        title: "No items selected",
        description: "Please select items to add to your pantry.",
        variant: "destructive",
      });
    }
  };

  // Load payment methods when dialog opens
  const handleOrderDialogOpen = (open: boolean) => {
    if (open) {
      getPaymentMethods();
    }
    setShowOrderDialog(open);
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
    const checkedItemNames = Object.entries(checkedItems)
      .filter(([_, isChecked]) => isChecked)
      .map(([itemId, _]) => {
        const item = plan.shoppingList?.find((item: any) => item.id === itemId);
        return item?.name;
      })
      .filter(Boolean);

    if (checkedItemNames.length === 0) {
      toast({
        title: "No items selected",
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
    setShowOrderDialog(false);
    setSelectedPaymentMethod("");
    setDeliveryAddress({ street: '', city: '', state: '', zipCode: '', country: '' });
    setShowAddPaymentMethod(false);
    setNewPaymentMethod({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });
  };

  const goToPreviousWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const goToNextWeek = () => {
    if (currentWeek < plan.numberOfWeeks) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const getCurrentWeekDateRange = () => {
    const startDate = new Date(plan.startDate);
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (currentWeek - 1) * 7);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return {
      start: weekStart.toLocaleDateString(),
      end: weekEnd.toLocaleDateString()
    };
  };

  const getDayWithDate = (dayName: string, dayIndex: number) => {
    const startDate = new Date(plan.startDate);
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (currentWeek - 1) * 7);
    
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);
    
    const dayNumber = dayDate.getDate();
    const monthName = dayDate.toLocaleDateString('en-US', { month: 'short' });
    
    return {
      name: dayName,
      dayNumber,
      monthName,
      fullDate: dayDate
    };
  };

  const weekDateRange = getCurrentWeekDateRange();
  const getCheckedItemsCount = () => Object.values(checkedItems).filter(Boolean).length;

  const handleSelectAll = () => {
    if (!plan.shoppingList) return;
    
    const allChecked = plan.shoppingList.every((item: any) => checkedItems[item.id]);
    const newCheckedItems: Record<string, boolean> = {};
    
    if (!allChecked) {
      // Select all items
      plan.shoppingList.forEach((item: any) => {
        newCheckedItems[item.id] = true;
      });
    }
    // If all are checked, uncheck all (empty object)
    
    setCheckedItems(newCheckedItems);
  };

  if (showShoppingList && plan.shoppingList) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => setShowShoppingList(false)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Meal Plan
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Shopping List - {plan.name}</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Dialog open={showAddToPantryDialog} onOpenChange={setShowAddToPantryDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-green-300 text-green-700 hover:bg-green-50 w-full sm:w-auto"
                  size="sm"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Shop In-Store ({getCheckedItemsCount()})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Items to Pantry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    This will add the selected items from your shopping list to your pantry with default expiry dates.
                  </p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium mb-2">Items to add: {getCheckedItemsCount()}</p>
                    <div className="text-sm text-gray-600">
                      {Object.entries(checkedItems)
                        .filter(([_, isChecked]) => isChecked)
                        .slice(0, 3)
                        .map(([itemId, _]) => {
                          const item = plan.shoppingList?.find((item: any) => item.id === itemId);
                          return item?.name;
                        })
                        .join(', ')}
                      {getCheckedItemsCount() > 3 && ` +${getCheckedItemsCount() - 3} more`}
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
            
            <Dialog open={showOrderDialog} onOpenChange={handleOrderDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-blue-500 text-white hover:bg-blue-600 w-full sm:w-auto"
                  size="sm"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Order Online ({getCheckedItemsCount()})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Complete Your Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Selected Items */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Selected Items ({getCheckedItemsCount()})</h3>
                    <div className="text-sm text-gray-600">
                      {Object.entries(checkedItems)
                        .filter(([_, isChecked]) => isChecked)
                        .map(([itemId, _]) => {
                          const item = plan.shoppingList?.find((item: any) => item.id === itemId);
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
                        setShowOrderDialog(false);
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  Shopping List ({plan.shoppingList.length} items)
                </CardTitle>
                <CardDescription>
                  Select ingredients to add to pantry or order online
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleSelectAll}
                className="flex items-center gap-2 w-full sm:w-auto"
                size="sm"
              >
                <CheckSquare className="h-4 w-4" />
                {plan.shoppingList.every((item: any) => checkedItems[item.id]) ? 'Unselect All' : 'Select All'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plan.shoppingList.map((item: any) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 sm:p-4 bg-white/80 rounded-lg border border-green-100 hover:bg-white/90 transition-colors">
                  <Checkbox
                    id={item.id}
                    checked={checkedItems[item.id] || false}
                    onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
            
            {plan.shoppingList.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No shopping list generated yet</p>
                <p className="text-sm">Go back and generate a shopping list from your meals</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" key={`${plan.id}-${meals.length}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Meal Planner
        </Button>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{plan.name}</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            onClick={onEdit}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50 w-full sm:w-auto"
            size="sm"
          >
            Edit Plan
          </Button>
          <Button 
            onClick={handleGenerateShoppingList}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 w-full sm:w-auto"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Generate Shopping List
          </Button>
        </div>
      </div>

      {/* Enhanced Plan Overview Card */}
      <Card className="bg-gradient-to-br from-white/80 to-purple-50/80 backdrop-blur-sm border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Plan Overview
          </CardTitle>
          <CardDescription>
            {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 sm:p-4 bg-white/60 rounded-lg border border-purple-100">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">{plan.numberOfWeeks}</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Weeks</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/60 rounded-lg border border-green-100">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{plan.numberOfPersons}</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Persons</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/60 rounded-lg border border-blue-100">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{plan.mealsPerDay}</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Meals/Day</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-white/60 rounded-lg border border-orange-100">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1">{meals.length}</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Total Meals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week Navigation */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Week {currentWeek} of {plan.numberOfWeeks}</CardTitle>
              <CardDescription>
                {weekDateRange.start} - {weekDateRange.end}
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousWeek}
                disabled={currentWeek === 1}
                className="flex-1 sm:flex-none"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextWeek}
                disabled={currentWeek === plan.numberOfWeeks}
                className="flex-1 sm:flex-none"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {dayNames.map((dayName, dayIndex) => {
              const dayNumber = dayIndex + 1;
              const dayMeals = mealsByDay[dayNumber] || [];
              const dayWithDate = getDayWithDate(dayName, dayIndex);
              
              return (
                <div key={dayNumber} className="space-y-3">
                  <h3 className="font-semibold text-lg text-gray-800 border-b border-gray-200 pb-2 flex items-center gap-2">
                    {dayWithDate.name}
                    <span className="text-sm font-normal text-gray-600">
                      {dayWithDate.monthName} {dayWithDate.dayNumber}
                    </span>
                  </h3>
                  
                  {dayMeals.length > 0 ? (
                    <div className="grid gap-3">
                      {dayMeals.map((meal: any) => (
                        <div
                          key={meal.id}
                          className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-white/50 relative"
                          onClick={() => handleMealClick(meal)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {meal.type?.charAt(0).toUpperCase() + meal.type?.slice(1)}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {meal.difficulty}
                                </Badge>
                                {completedMeals[meal.id] && (
                                  <Badge className="text-xs bg-green-500">
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-semibold text-gray-800">{meal.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {meal.calories || 0} cal
                                {meal.protein && ` • ${meal.protein}g protein`}
                                {meal.carbs && ` • ${meal.carbs}g carbs`}
                                {meal.fat && ` • ${meal.fat}g fat`}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {meal.prepTime}min
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {meal.servings} serving{meal.servings > 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => toggleMealCompletion(meal, e)}
                                className={`p-2 ${completedMeals[meal.id] ? 'text-green-600' : 'text-gray-400'}`}
                              >
                                <CheckCircle className="h-5 w-5" />
                              </Button>
                              <ChefHat className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                      <p className="text-sm">No meals planned for this day</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {weekMeals.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No meals planned for this week</p>
        </div>
      )}
    </div>
  );
};

export default MealPlanView;
