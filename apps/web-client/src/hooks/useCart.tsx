"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Product } from "@/types";

interface CartItem {
  id: string;
  product_id: string;
  title: string;
  price: number;
  image_url?: string;
  quantity: number;
  seller_id: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product:
      | Product
      | {
          id: string;
          title: string;
          price: number;
          seller_id: string;
          images?: { url: string }[];
        },
  ) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("iubizon_cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart:", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("iubizon_cart", JSON.stringify(items));
    }
  }, [items, isLoading]);

  const addItem = useCallback(
    (
      product:
        | Product
        | {
            id: string;
            title: string;
            price: number;
            seller_id: string;
            images?: { url: string }[];
          },
    ) => {
      setItems((prev) => {
        const existingItem = prev.find(
          (item) => item.product_id === product.id,
        );

        if (existingItem) {
          return prev.map((item) =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }

        const newItem: CartItem = {
          id: `cart-${product.id}-${Date.now()}`,
          product_id: product.id,
          title: product.title,
          price: product.price,
          image_url:
            typeof product.images?.[0] === "string"
              ? product.images[0]
              : product.images?.[0]?.url,
          quantity: 1,
          seller_id: product.seller_id,
        };

        return [...prev, newItem];
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.product_id === productId ? { ...item, quantity } : item,
        ),
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("iubizon_cart");
  }, []);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}