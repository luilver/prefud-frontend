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
import { CalendarIcon, Plus, X, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { addIngredientsToPantry, PantryIngredient } from "@/services/pantryService";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { user } = useUser();
  const { t } = useLanguage();

  // Category and unit mapping to ensure API compatibility
  const categoryOptions = [
    { value: t("addIngredient.categories.dairy"), apiValue: "dairy", label: t("addIngredient.categories.dairy") },
    { value: t("addIngredient.categories.fruit"), apiValue: "fruit", label: t("addIngredient.categories.fruit") },
    { value: t("addIngredient.categories.vegetable"), apiValue: "vegetable", label: t("addIngredient.categories.vegetable") },
    { value: t("addIngredient.categories.grain"), apiValue: "grain", label: t("addIngredient.categories.grain") },
    { value: t("addIngredient.categories.herb"), apiValue: "herb", label: t("addIngredient.categories.herb") },
    { value: t("addIngredient.categories.spice"), apiValue: "spice", label: t("addIngredient.categories.spice") },
    { value: t("addIngredient.categories.protein"), apiValue: "protein", label: t("addIngredient.categories.protein") },
    { value: t("addIngredient.categories.oil"), apiValue: "oil", label: t("addIngredient.categories.oil") },
    { value: t("addIngredient.categories.other"), apiValue: "other", label: t("addIngredient.categories.other") }
  ];

  const unitOptions = [
    { value: t("addIngredient.units.pieces"), apiValue: "pieces", label: t("addIngredient.units.pieces") },
    { value: t("addIngredient.units.unit"), apiValue: "unit", label: t("addIngredient.units.unit") },
    { value: t("addIngredient.units.g"), apiValue: "g", label: t("addIngredient.units.g") },
    { value: t("addIngredient.units.kg"), apiValue: "kg", label: t("addIngredient.units.kg") },
    { value: t("addIngredient.units.lbs"), apiValue: "lbs", label: t("addIngredient.units.lbs") },
    { value: t("addIngredient.units.cups"), apiValue: "cups", label: t("addIngredient.units.cups") },
    { value: t("addIngredient.units.ml"), apiValue: "ml", label: t("addIngredient.units.ml") },
    { value: t("addIngredient.units.l"), apiValue: "l", label: t("addIngredient.units.l") },
    { value: t("addIngredient.units.spoons"), apiValue: "spoons", label: t("addIngredient.units.spoons") },
    { value: t("addIngredient.units.bag"), apiValue: "bag", label: t("addIngredient.units.bag") },
    { value: t("addIngredient.units.box"), apiValue: "box", label: t("addIngredient.units.box") }
  ];

  const handleProductDetected = (productName: string, imageBlob: Blob) => {
    setName(productName);
    setProductImage(imageBlob);
    setShowCamera(false);

    // Auto-suggest category based on product name
    const categoryMap: Record<string, string> = {
      chicken: "Meat",
      beef: "Meat",
      pork: "Meat",
      turkey: "Meat",
      milk: "Dairy",
      cheese: "Dairy",
      yogurt: "Dairy",
      butter: "Dairy",
      banana: "Fruits",
      apple: "Fruits",
      orange: "Fruits",
      grapes: "Fruits",
      tomato: "Vegetables",
      onion: "Vegetables",
      carrot: "Vegetables",
      pepper: "Vegetables",
      bread: "Grains",
      rice: "Grains",
      pasta: "Grains",
      cereal: "Grains",
    };

    const detectedCategory = Object.entries(categoryMap).find(([key]) =>
      productName.toLowerCase().includes(key)
    )?.[1];

    if (detectedCategory) {
      setCategory(detectedCategory);
    }

    toast({
      title: t("addIngredient.productDetected"),
      description: `${productName} ${t("addIngredient.productDetectedDesc")}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !unit || !category || !expiryDate) {
      toast({
        title: t("addIngredient.missingFields"),
        description: t("addIngredient.missingFieldsDesc"),
        variant: "destructive",
      });
      return;
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
      const daysToExpire = Math.ceil((expiryDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Convert multilingual values back to API format
      const categoryApiValue = categoryOptions.find(opt => opt.value === category)?.apiValue || category;
      const unitApiValue = unitOptions.find(opt => opt.value === unit)?.apiValue || unit;
      
      const newIngredient: PantryIngredient = {
        id: `pantry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name,
        quantity: parseFloat(quantity),
        unit: unitApiValue,
        category: categoryApiValue.toLowerCase(),
        purchased: true,
        purchaseDate: purchaseDate.toISOString(),
        carbonFootPrintToWaste: 0.5,
        daysToExpire,
        expiryDate: expiryDate.toISOString(),
        notes: `Carbon footprint: 0.5`
      };

      console.log("Adding ingredient to API:", newIngredient);

      // Call the API to add the ingredient
      await addIngredientsToPantry(user.id, [newIngredient]);

      // Also call the local onAdd callback for immediate UI update
      onAdd({
        id: newIngredient.id,
        name,
        quantity: parseFloat(quantity),
        unit,
        category,
        location: location || "Pantry",
        expiryDate,
        image: productImage ? URL.createObjectURL(productImage) : undefined,
        addedViaCamera: !!productImage,
      });

      toast({
        title: t("addIngredient.ingredientAdded"),
        description: `${name} ${t("addIngredient.ingredientAddedDesc")}`,
      });
      onClose();
    } catch (error: any) {
      console.error("Error adding ingredient:", error);
      toast({
        title: t("addIngredient.error"),
        description: error.response?.data?.message || t("addIngredient.errorDesc"),
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
              {t("addIngredient.title")}
            </CardTitle>
            <CardDescription>
              {t("addIngredient.description")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowCamera(true)}
            className="w-full border-green-300 text-green-700 hover:bg-green-50"
          >
            <Camera className="h-4 w-4 mr-2" />
            {t("addIngredient.scanProduct")}
          </Button>
        </div> */}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t("addIngredient.ingredientName")} *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("addIngredient.ingredientNamePlaceholder")}
                className="border-green-200 focus:border-green-400"
                maxLength={40}
              />
            </div>
            <div>
              <Label htmlFor="category">{t("addIngredient.category")} *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder={t("addIngredient.categorySelect")} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 z-50">
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.apiValue} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">{t("addIngredient.quantity")} *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t("addIngredient.quantityPlaceholder")}
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div>
              <Label htmlFor="unit">{t("addIngredient.unit")} *</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="border-green-200 focus:border-green-400">
                  <SelectValue placeholder={t("addIngredient.unitSelect")} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 z-50">
                  {unitOptions.map((option) => (
                    <SelectItem key={option.apiValue} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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
                  {expiryDate ? format(expiryDate, "PPP") : t("addIngredient.pickDate")}
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

          {/* {productImage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                ✓ Product image captured via camera
              </p>
            </div>
          )} */}

          <div className="flex space-x-2 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600"
              disabled={isLoading}
            >
              {isLoading ? t("addIngredient.addingButton") : t("addIngredient.addButton")}
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
