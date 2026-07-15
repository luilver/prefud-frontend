import React from "react";
import type { IngredientListItem } from "@/types/assistant";

interface Props {
  items: IngredientListItem[];
  pricePerItem?: number;
}

const CartSummaryWidget: React.FC<Props> = ({ items, pricePerItem = 1.75 }) => {
  const subtotal = items.length * pricePerItem;
  const delivery = 4.99;
  const service = subtotal * 0.05;
  const total = subtotal + delivery + service;
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="p-3 border-b border-border">
        <div className="text-sm font-semibold">Resumen del carrito</div>
        <div className="text-xs text-muted-foreground">{items.length} articulos</div>
      </div>
      <ul className="max-h-40 overflow-auto text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex justify-between px-3 py-1.5 border-b border-border last:border-0">
            <span className="truncate">{it.name}</span>
            <span className="text-muted-foreground text-xs">{it.quantity} {it.unit}</span>
          </li>
        ))}
      </ul>
      <div className="p-3 text-xs space-y-1">
        <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Envio</span><span>${delivery.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Servicio</span><span>${service.toFixed(2)}</span></div>
        <div className="flex justify-between font-semibold text-sm text-foreground pt-1 border-t border-border">
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export function computeCartTotal(items: IngredientListItem[], pricePerItem = 1.75) {
  const subtotal = items.length * pricePerItem;
  const delivery = 4.99;
  const service = subtotal * 0.05;
  return subtotal + delivery + service;
}

export default CartSummaryWidget;
