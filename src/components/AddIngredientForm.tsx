import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, X, Camera, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import {
  addIngredientsToPantry,
  PantryIngredient,
} from "@/services/pantryService";
import { useLanguage } from "@/contexts/LanguageContext";
import CameraProductScanner from "./CameraProductScanner";
import AnalyzeImageCapture from "./AnalyzeImageCapture";

interface IngredientFormData {
  name: string;
  quantity: string;
  unit: string;
  category: string;
  location: string;
  expiryDate: Date | undefined;
  productImage: Blob | null;
}

interface AddIngredientFormProps {
  onClose: () => void;
  onAdd: (ingredient: any) => void;
}

const AddIngredientForm = ({ onClose, onAdd }: AddIngredientFormProps) => {
  const [ingredients, setIngredients] = useState<IngredientFormData[]>([{
    name: "",
    quantity: "",
    unit: "",
    category: "",
    location: "",
    expiryDate: undefined,
    productImage: null,
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showAnalyzeImage, setShowAnalyzeImage] = useState(false);
  const [cameraIngredientIndex, setCameraIngredientIndex] = useState(0);
  const { toast } = useToast();
  const { user } = useUser();
  const { t } = useLanguage();

  const addIngredient = () => {
    setIngredients([...ingredients, {
      name: "",
      quantity: "",
      unit: "",
      category: "",
      location: "",
      expiryDate: undefined,
      productImage: null,
    }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof IngredientFormData, value: any) => {
    const updatedIngredients = ingredients.map((ingredient, i) => 
      i === index ? { ...ingredient, [field]: value } : ingredient
    );
    setIngredients(updatedIngredients);
  };

  const handleProductDetected = (productName: string, imageBlob: Blob) => {
    updateIngredient(cameraIngredientIndex, 'name', productName);
    updateIngredient(cameraIngredientIndex, 'productImage', imageBlob);
    setShowCamera(false);

    // Auto-suggest category based on product name
    const categoryMap: Record<string, string> = {
      chicken: t("addIngredient.categories.protein.value"),
      beef: t("addIngredient.categories.protein.value"),
      pork: t("addIngredient.categories.protein.value"),
      turkey: t("addIngredient.categories.protein.value"),
      milk: t("addIngredient.categories.dairy.value"),
      cheese: t("addIngredient.categories.dairy.value"),
      yogurt: t("addIngredient.categories.dairy.value"),
      butter: t("addIngredient.categories.dairy.value"),
      banana: t("addIngredient.categories.fruit.value"),
      apple: t("addIngredient.categories.fruit.value"),
      orange: t("addIngredient.categories.fruit.value"),
      grapes: t("addIngredient.categories.fruit.value"),
      tomato: t("addIngredient.categories.vegetable.value"),
      onion: t("addIngredient.categories.vegetable.value"),
      carrot: t("addIngredient.categories.vegetable.value"),
      pepper: t("addIngredient.categories.vegetable.value"),
      bread: t("addIngredient.categories.grain.value"),
      rice: t("addIngredient.categories.grain.value"),
      pasta: t("addIngredient.categories.grain.value"),
      cereal: t("addIngredient.categories.grain.value"),
    };

    const detectedCategory = Object.entries(categoryMap).find(([key]) =>
      productName.toLowerCase().includes(key)
    )?.[1];

    if (detectedCategory) {
      updateIngredient(cameraIngredientIndex, 'category', detectedCategory);
    }

    toast({
      title: t("addIngredient.productDetected"),
      description: `${productName} ${t("addIngredient.productDetectedDesc")}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all ingredients
    for (const ingredient of ingredients) {
      if (!ingredient.name || !ingredient.quantity || !ingredient.unit || !ingredient.category || !ingredient.expiryDate) {
        toast({
          title: t("addIngredient.missingFields"),
          description: t("addIngredient.missingFieldsDesc"),
          variant: "destructive",
        });
        return;
      }
    }

    if (!user?.id) {
      toast({
        title: t("addIngredient.error"),
        description: t("addIngredient.userNotFound"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const purchaseDate = new Date();
      const newIngredients: PantryIngredient[] = [];
      
      // Process all ingredients
      for (const ingredient of ingredients) {
        const daysToExpire = Math.ceil(
          (ingredient.expiryDate!.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const newIngredient: PantryIngredient = {
          id: `pantry-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          name: ingredient.name,
          quantity: parseFloat(ingredient.quantity),
          unit: ingredient.unit,
          category: ingredient.category.toLowerCase(),
          purchased: true,
          purchaseDate: purchaseDate.toISOString(),
          carbonFootPrintToWaste: 0.5,
          daysToExpire,
          expiryDate: ingredient.expiryDate!.toISOString(),
          notes: `Carbon footprint: 0.5`,
        };

        newIngredients.push(newIngredient);

        // Also call the local onAdd callback for immediate UI update
        onAdd({
          id: newIngredient.id,
          name: ingredient.name,
          quantity: parseFloat(ingredient.quantity),
          unit: ingredient.unit,
          category: ingredient.category,
          location: ingredient.location || "Pantry",
          expiryDate: ingredient.expiryDate,
          image: ingredient.productImage ? URL.createObjectURL(ingredient.productImage) : undefined,
          addedViaCamera: !!ingredient.productImage,
        });
      }

      console.log("Adding ingredients to API:", newIngredients);

      // Call the API to add all ingredients
      await addIngredientsToPantry(user.id, newIngredients);

      toast({
        title: ingredients.length === 1 ? t("addIngredient.ingredientAdded") : t("addIngredient.allIngredientsAdded"),
        description: ingredients.length === 1 
          ? `${ingredients[0].name} ${t("addIngredient.ingredientAddedDesc")}` 
          : `${ingredients.length} ${t("addIngredient.allIngredientsAddedDesc")}`,
      });
      onClose();
    } catch (error: any) {
      console.error("Error adding ingredient:", error);
      toast({
        title: t("addIngredient.error"),
        description:
          error.response?.data?.message || t("addIngredient.errorDesc"),
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

  if (showAnalyzeImage) {
    return (
      <AnalyzeImageCapture
        onBack={() => setShowAnalyzeImage(false)}
        onJobStarted={onClose}
      />
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-green-200">
      <CardHeader>
        <CardTitle className="text-green-700 flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          {ingredients.length === 1 ? t("addIngredient.title") : t("addIngredient.multipleTitle")}
        </CardTitle>
        <CardDescription>
          {ingredients.length === 1 ? t("addIngredient.description") : t("addIngredient.multipleDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Button
            type="button"
            onClick={() => setShowAnalyzeImage(true)}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30"
          >
            <Camera className="h-4 w-4 mr-2" />
            {t("addIngredient.scanWithCamera") || "Scan ingredients with camera"}
          </Button>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="border border-green-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-green-700">
                  {t("addIngredient.ingredient")} {index + 1}
                </h3>
                {ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`name-${index}`}>
                    {t("addIngredient.ingredientName")} *
                  </Label>
                  <Input
                    id={`name-${index}`}
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    placeholder={t("addIngredient.ingredientNamePlaceholder")}
                    className="border-green-200 focus:border-green-400"
                    maxLength={40}
                  />
                </div>
                <div>
                  <Label htmlFor={`category-${index}`}>{t("addIngredient.category")} *</Label>
                  <Select 
                    value={ingredient.category} 
                    onValueChange={(value) => updateIngredient(index, 'category', value)}
                  >
                    <SelectTrigger className="border-green-200 focus:border-green-400">
                      <SelectValue
                        placeholder={t("addIngredient.categorySelect")}
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 z-50">
                      <SelectItem value={t("addIngredient.categories.dairy.value")}>
                        {t("addIngredient.categories.dairy")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.categories.fruit.value")}>
                        {t("addIngredient.categories.fruit")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.categories.vegetable.value")}>
                        {t("addIngredient.categories.vegetable")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.categories.grain.value")}>
                        {t("addIngredient.categories.grain")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.categories.herb.value")}>
                        {t("addIngredient.categories.herb")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.categories.spice.value")}>
                        {t("addIngredient.categories.spice")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.categories.protein.value")}>
                        {t("addIngredient.categories.protein")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.categories.oil.value")}>
                        {t("addIngredient.categories.oil")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.categories.other.value")}>
                        {t("addIngredient.categories.other")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`quantity-${index}`}>{t("addIngredient.quantity")} *</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    step="0.1"
                    value={ingredient.quantity}
                    onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                    placeholder={t("addIngredient.quantityPlaceholder")}
                    className="border-green-200 focus:border-green-400"
                  />
                </div>
                <div>
                  <Label htmlFor={`unit-${index}`}>{t("addIngredient.unit")} *</Label>
                  <Select 
                    value={ingredient.unit} 
                    onValueChange={(value) => updateIngredient(index, 'unit', value)}
                  >
                    <SelectTrigger className="border-green-200 focus:border-green-400">
                      <SelectValue placeholder={t("addIngredient.unitSelect")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 z-50">
                      <SelectItem value={t("addIngredient.units.pieces.value")}>
                        {t("addIngredient.units.pieces")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.units.unit.value")}>
                        {t("addIngredient.units.unit")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.units.g.value")}>
                        {t("addIngredient.units.g")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.units.kg.value")}>
                        {t("addIngredient.units.kg")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.units.lbs.value")}>
                        {t("addIngredient.units.lbs")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.units.cups.value")}>
                        {t("addIngredient.units.cups")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.units.ml.value")}>
                        {t("addIngredient.units.ml")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.units.l.value")}>
                        {t("addIngredient.units.l")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.units.spoons.value")}>
                        {t("addIngredient.units.spoons")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.units.bag.value")}>
                        {t("addIngredient.units.bag")}
                      </SelectItem>
                      <SelectItem value={t("addIngredient.units.box.value")}>
                        {t("addIngredient.units.box")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{t("addIngredient.expiryDate")} *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-green-200 focus:border-green-400"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {ingredient.expiryDate
                        ? format(ingredient.expiryDate, "PPP")
                        : t("addIngredient.pickDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={ingredient.expiryDate}
                      onSelect={(date) => updateIngredient(index, 'expiryDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={addIngredient}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("addIngredient.addAnother")}
            </Button>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
              disabled={isLoading}
            >
              {isLoading
                ? (ingredients.length === 1 ? t("addIngredient.addingButton") : t("addIngredient.addingAllIngredients"))
                : (ingredients.length === 1 ? t("addIngredient.addButton") : t("addIngredient.addAllIngredients"))}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("addIngredient.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddIngredientForm;