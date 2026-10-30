"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  discount_price: number | null;
  quantity: number;
  image_url: string | null;
  stock_quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (product_id: string) => void;
  updateQuantity: (product_id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  mounted: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_KEY = "store-cart";

function storageKeyFor(userId: string | undefined): string {
  return userId ? `store-cart:${userId}` : GUEST_KEY;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { user } = useAuth();
  const loadedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentKey = storageKeyFor(user?.id);

    if (loadedForUserRef.current !== (user?.id ?? null)) {
      try {
        const stored = window.localStorage.getItem(currentKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setItems(parsed);
          } else {
            setItems([]);
          }
        } else {
          setItems([]);
        }
      } catch (e) {
        console.error("CART_HYDRATION_ERROR", e);
        setItems([]);
      }
      loadedForUserRef.current = user?.id ?? null;
    }

    setIsHydrated(true);
  }, [user?.id]);

  useEffect(() => {
    if (!isHydrated) return;
    if (typeof window === "undefined") return;
    try {
      const currentKey = storageKeyFor(user?.id);
      window.localStorage.setItem(currentKey, JSON.stringify(items));
      console.log("CART_STORAGE", currentKey, items);
    } catch (e) {
      console.error("CART_PERSIST_ERROR", e);
    }
  }, [items, isHydrated, user?.id]);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    console.log("ADD_TO_CART", item, quantity);
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === item.product_id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, item.stock_quantity);
        return prev.map((i) => (i.product_id === item.product_id ? { ...i, quantity: newQty } : i));
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.stock_quantity) }];
    });
  };

  const removeItem = (product_id: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== product_id));
  };

  const updateQuantity = (product_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(product_id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.product_id === product_id) {
          const qty = Math.min(quantity, i.stock_quantity);
          return { ...i, quantity: qty };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => {
    const price = i.discount_price ?? i.price;
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        mounted: isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      totalItems: 0,
      totalAmount: 0,
      mounted: false,
    };
  }
  return context;
}
