import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { List, ListItem, ListIcon, OrderedList, UnorderedList } from "@/components/ui/list"
import { CheckCircle, Circle, Utensils, ChevronsLeft, Plus, ShoppingCart, Edit, Trash2, Check, Store } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MealPlanViewProps {
  planId: string;
  onBack: () => void;
}

const MealPlanView = ({ planId, onBack }: MealPlanViewProps) => {
  const { getMealPlanById, updateMealPlan, addIngredient, addShoppingItem, ingredients, shoppingItems } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [showIngredientDialog, setShowIngredientDialog] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: 1,
    unit: "piece",
    category: "",
    location: "pantry",
    expiryDate: new Date(),
    purchaseDate: new Date(),
    addedFromShoppingList: false,
  });
  const [showAddToShoppingListDialog, setShowAddToShoppingListDialog] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'expiry' | 'purchase'>('expiry');

  useEffect(() => {
    const plan = getMealPlanById(planId);
    if (plan) {
      setMealPlan(plan);
      setNotes(plan.notes || "");
    }
    setIsLoading(false);
  }, [planId, getMealPlanById]);

  const handleEditNotes = () => {
    setIsEditingNotes(true);
  };

  const handleSaveNotes = async () => {
    await updateMealPlan(mealPlan.id, { notes: notes });
    setIsEditingNotes(false);
    toast({
      title: "Notes Saved",
      description: "Your notes have been updated.",
    });
  };

  const handleCancelEditNotes = () => {
    setNotes(mealPlan.notes || "");
    setIsEditingNotes(false);
  };

  const handleAddToPantry = async (ingredient: any) => {
    try {
      addIngredient({
        id: Date.now().toString(), // Add the missing id property
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: ingredient.category,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });
      
      toast({
        title: "Added to Pantry",
        description: `${ingredient.name} has been added to your pantry.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add ingredient to pantry.",
        variant: "destructive",
      });
    }
  };

  const handleOpenAddToShoppingListDialog = (ingredient: any) => {
    setSelectedIngredient(ingredient);
    setShowAddToShoppingListDialog(true);
  };

  const handleAddToShoppingList = async () => {
    if (!selectedIngredient) return;

    try {
      addShoppingItem({
        id: Date.now().toString(),
        name: selectedIngredient.name,
        quantity: selectedIngredient.quantity || 1,
        unit: selectedIngredient.unit || 'piece',
        category: selectedIngredient.category,
        purchased: false,
        price: 0
      });

      toast({
        title: "Added to Shopping List",
        description: `${selectedIngredient.name} has been added to your shopping list.`,
      });
      setShowAddToShoppingListDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to shopping list.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewIngredient(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    setNewIngredient(prev => ({ ...prev, [datePickerType + 'Date']: date }));
    setShowDatePicker(false);
  };

  const handleAddIngredientToPantry = async () => {
    try {
      addIngredient({
        id: Date.now().toString(),
        name: newIngredient.name,
        quantity: newIngredient.quantity,
        unit: newIngredient.unit,
        category: newIngredient.category,
        expiryDate: newIngredient.expiryDate,
      });
      toast({
        title: "Ingredient Added",
        description: `${newIngredient.name} has been added to your pantry.`,
      });
      setShowIngredientDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add ingredient to pantry.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading meal plan...</div>;
  }

  if (!mealPlan) {
    return <div className="text-center p-4">Meal plan not found.</div>;
  }

  return (
    <div className="container mx-auto mt-4 p-4">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronsLeft className="h-4 w-4 mr-2" />
        Back to Meal Plans
      </Button>

      <Card className="bg-white shadow-md rounded-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{mealPlan.name}</CardTitle>
          <CardDescription>
            Enjoy your {mealPlan.cuisine} cuisine!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
              <ScrollArea className="h-[200px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mealPlan.ingredients && mealPlan.ingredients.map((ingredient: any) => (
                      <TableRow key={ingredient.name}>
                        <TableCell>{ingredient.name}</TableCell>
                        <TableCell>{`${ingredient.quantity} ${ingredient.unit}`}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="secondary" size="sm" onClick={() => handleAddToPantry(ingredient)}>
                            <Store className="h-4 w-4 mr-2" />
                            Pantry
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleOpenAddToShoppingListDialog(ingredient)}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Shopping
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Instructions</h3>
              <ScrollArea className="h-[200px] rounded-md border">
                <OrderedList className="list-decimal pl-6">
                  {mealPlan.instructions && mealPlan.instructions.map((instruction: string, index: number) => (
                    <ListItem key={index}>{instruction}</ListItem>
                  ))}
                </OrderedList>
              </ScrollArea>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            {isEditingNotes ? (
              <div className="space-y-2">
                <Input
                  type="textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="secondary" onClick={handleSaveNotes}>
                    Save
                  </Button>
                  <Button variant="ghost" onClick={handleCancelEditNotes}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p>{mealPlan.notes || "No notes added."}</p>
                <Button variant="ghost" size="sm" onClick={handleEditNotes}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Notes
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showIngredientDialog} onOpenChange={setShowIngredientDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Ingredient to Pantry
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Ingredient</DialogTitle>
            <DialogDescription>
              Add a new ingredient to your pantry.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" value={newIngredient.name} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                type="number"
                id="quantity"
                name="quantity"
                value={newIngredient.quantity}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                className="col-span-1"
              />
              <Select onValueChange={(value) => setNewIngredient(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Unit" defaultValue={newIngredient.unit} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="gram">Gram</SelectItem>
                  <SelectItem value="ml">Milliliter</SelectItem>
                  <SelectItem value="cup">Cup</SelectItem>
                  <SelectItem value="tablespoon">Tablespoon</SelectItem>
                  <SelectItem value="teaspoon">Teaspoon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input id="category" name="category" value={newIngredient.category} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiryDate" className="text-right">
                Expiry Date
              </Label>
              <Popover open={showDatePicker && datePickerType === 'expiry'} onOpenChange={() => {
                setShowDatePicker(!showDatePicker);
                setDatePickerType('expiry');
              }}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newIngredient.expiryDate && "text-muted-foreground"
                    )}
                  >
                    {newIngredient.expiryDate ? (
                      format(newIngredient.expiryDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newIngredient.expiryDate}
                    onSelect={handleDateChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddIngredientToPantry}>
              Add to Pantry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddToShoppingListDialog} onOpenChange={setShowAddToShoppingListDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add to Shopping List</DialogTitle>
            <DialogDescription>
              Are you sure you want to add {selectedIngredient?.name} to your shopping list?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowAddToShoppingListDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleAddToShoppingList}>
              Add to List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealPlanView;
