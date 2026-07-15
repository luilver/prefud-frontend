import React from "react";
import type { NutritionalInfo } from "@/types/assistant";
import { Flame, Beef, Droplet, Wheat, Sprout, Leaf } from "lucide-react";

interface Props {
  info: NutritionalInfo;
  calories?: number;
  carbon?: number;
}

const Cell: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex-1 min-w-[80px] rounded-lg bg-muted/60 px-2 py-2 text-center">
    <div className="flex items-center justify-center text-primary mb-0.5">{icon}</div>
    <div className="text-sm font-semibold text-foreground">{value}</div>
    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
  </div>
);

const MacrosBar: React.FC<Props> = ({ info, calories, carbon }) => (
  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
    {calories !== undefined && <Cell icon={<Flame className="h-4 w-4" />} label="kcal" value={String(calories)} />}
    <Cell icon={<Beef className="h-4 w-4" />} label="Protein" value={`${info.protein}g`} />
    <Cell icon={<Droplet className="h-4 w-4" />} label="Fat" value={`${info.fat}g`} />
    <Cell icon={<Wheat className="h-4 w-4" />} label="Carbs" value={`${info.carbohydrates}g`} />
    <Cell icon={<Sprout className="h-4 w-4" />} label="Fiber" value={`${info.fiber}g`} />
    {carbon !== undefined && <Cell icon={<Leaf className="h-4 w-4" />} label="CO2" value={`${carbon}`} />}
  </div>
);

export default MacrosBar;
