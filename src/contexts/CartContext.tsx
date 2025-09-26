import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  quantity: number; // For unit items: actual quantity. For non-unit items: counter/multiplier
  baseQuantity?: number; // Original quantity for non-unit items
  unit: string;
  category?: string;
  addedAt: Date;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getDisplayQuantity: (item: CartItem) => number;
  isUnitItem: (unit: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pantry-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        })));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pantry-cart', JSON.stringify(items));
  }, [items]);

  // Helper function to check if unit is a "unit" type
  const isUnitItem = (unit: string) => {
    const unitTranslations = ['unit', 'unidad', 'unidade', 'pieces', 'piezas', 'peças'];
    return unitTranslations.includes(unit.toLowerCase());
  };

  // Helper function to get display quantity
  const getDisplayQuantity = (item: CartItem) => {
    if (isUnitItem(item.unit)) {
      return item.quantity;
    } else {
      return (item.baseQuantity || 0) * item.quantity;
    }
  };

  const addItem = (newItem: Omit<CartItem, 'id' | 'addedAt'>) => {
    const existingItem = items.find(item => 
      item.name.toLowerCase() === newItem.name.toLowerCase() && 
      item.unit === newItem.unit
    );

    if (existingItem) {
      // For existing items, increment the counter
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const isUnit = isUnitItem(newItem.unit);
      const item: CartItem = {
        ...newItem,
        quantity: isUnit ? newItem.quantity : 1, // For unit items: use quantity, for others: start with counter 1
        baseQuantity: isUnit ? undefined : newItem.quantity, // Store base quantity for non-unit items
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        addedAt: new Date()
      };
      setItems(prev => [...prev, item]);
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getDisplayQuantity,
      isUnitItem
    }}>
      {children}
    </CartContext.Provider>
  );
};