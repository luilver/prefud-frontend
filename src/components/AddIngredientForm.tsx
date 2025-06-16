import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, X, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CameraProductScanner from "./CameraProductScanner";

interface AddIngredientFormProps {
  onClose: () => void;
  onAdd: (ingredient: any) => void;
}

const AddIngredientForm = ({ onClose, onAdd }: AddIngredientFormProps) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [productImage, setProductImage] = useState<Blob | null>(null);
  const { toast } = useToast();

  const handleProductDetected = (productName: string, imageBlob: Blob) => {
    setName(productName);
    setProductImage(imageBlob);
    setShowCamera(false);
    
    // Auto-suggest category based on product name
    const categoryMap: Record<string, string> = {
      'chicken': 'Meat', 'beef': 'Meat', 'pork': 'Meat', 'turkey': 'Meat',
      'milk': 'Dairy', 'cheese': 'Dairy', 'yogurt': 'Dairy', 'butter': 'Dairy',
      'banana': 'Fruits', 'apple': 'Fruits', 'orange': 'Fruits', 'grapes': 'Fruits',
      'tomato': 'Vegetables', 'onion': 'Vegetables', 'carrot': 'Vegetables', 'pepper': 'Vegetables',
      'bread': 'Grains', 'rice': 'Grains', 'pasta': 'Grains', 'cereal': 'Grains'
    };

    const detectedCategory = Object.entries(categoryMap).find(([key]) => 
      productName.toLowerCase().includes(key)
    )?.[1];

    if (detectedCategory) {
      setCategory(detectedCategory);
    }

    toast({
      title: "Product Added!",
      description: `${productName} detected. Please fill in the remaining details.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !unit || !category || !expiryDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const newIngredient = {
        id: Date.now().toString(),
        name,
        quantity: parseFloat(quantity),
        unit,
        category,
        location: location || "Pantry",
        expiryDate,
        image: productImage ? URL.createObjectURL(productImage) : undefined,
        addedViaCamera: !!productImage
      };

      console.log('Adding ingredient:', newIngredient);
      
      onAdd(newIngredient);
      toast({
        title: "Ingredient added!",
        description: `${name} has been added to your pantry.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add ingredient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showCamera) {
    return (
      <CameraProductScanner
        onProductDetected={handleProductDetected}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-green-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-green-700 flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Ingredient
            </CardTitle>
            <CardDescription>
              Add a new ingredient to your pantry
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCamera(true)}
            className="w-full border-green-300 text-green-700 hover:bg-green-50"
          >
            <Camera className="h-4 w-4 mr-2" />
            Scan Product with Camera
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Ingredient Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Chicken Breast"
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meat">Meat</SelectItem>
                  <SelectItem value="Dairy">Dairy</SelectItem>
                  <SelectItem value="Fruits">Fruits</SelectItem>
                  <SelectItem value="Vegetables">Vegetables</SelectItem>
                  <SelectItem value="Grains">Grains</SelectItem>
                  <SelectItem value="Pantry">Pantry</SelectItem>
                  <SelectItem value="Spices">Spices</SelectItem>
                  <SelectItem value="Beverages">Beverages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1.5"
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pieces">pieces</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="oz">oz</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="cups">cups</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="l">l</SelectItem>
                  <SelectItem value="container">container</SelectItem>
                  <SelectItem value="bag">bag</SelectItem>
                  <SelectItem value="box">box</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Storage Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="border-green-200 focus:border-green-400">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Refrigerator">Refrigerator</SelectItem>
                <SelectItem value="Freezer">Freezer</SelectItem>
                <SelectItem value="Pantry">Pantry</SelectItem>
                <SelectItem value="Counter">Counter</SelectItem>
                <SelectItem value="Spice Rack">Spice Rack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Expiry Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-green-200 focus:border-green-400"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {productImage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">✓ Product image captured via camera</p>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Ingredient'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddIngredientForm;
