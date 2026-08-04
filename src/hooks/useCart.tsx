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
  stock?: number;
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
          stock?: number;
        },
    quantityToAdd?: number,
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

  // Sync fresh stock & price from DB for cart items
  useEffect(() => {
    if (isLoading) return;

    let isMounted = true;
    const syncStock = async () => {
      if (items.length === 0) return;
      try {
        const updated = await Promise.all(
          items.map(async (item) => {
            try {
              const res = await fetch(`/api/products/${item.product_id}`);
              const data = await res.json();
              if (res.ok && data.product) {
                const freshStock = typeof data.product.stock === "number" ? data.product.stock : 10;
                const freshPrice = Number(data.product.price) || item.price;
                return {
                  ...item,
                  stock: freshStock,
                  price: freshPrice,
                  quantity: Math.min(item.quantity, freshStock),
                };
              }
            } catch {
              // fallback
            }
            return item;
          })
        );

        if (isMounted) {
          setItems((prev) => {
            let hasChanges = false;
            const nextItems = prev.map((prevItem) => {
              const fresh = updated.find((u) => u.product_id === prevItem.product_id);
              if (fresh && (prevItem.stock !== fresh.stock || prevItem.price !== fresh.price)) {
                hasChanges = true;
                return {
                  ...prevItem,
                  stock: fresh.stock,
                  price: fresh.price,
                  quantity: Math.min(prevItem.quantity, fresh.stock),
                };
              }
              return prevItem;
            });
            return hasChanges ? nextItems : prev;
          });
        }
      } catch (e) {
        console.error("Error al sincronizar stock del carrito:", e);
      }
    };

    syncStock();
    return () => {
      isMounted = false;
    };
  }, [isLoading, items.length]);

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
            stock?: number;
          },
      quantityToAdd: number = 1,
    ) => {
      setItems((prev) => {
        const existingItem = prev.find(
          (item) => item.product_id === product.id,
        );

        const availableStock = product.stock ?? existingItem?.stock ?? 10;

        if (existingItem) {
          const newQty = Math.min(existingItem.quantity + quantityToAdd, availableStock);
          return prev.map((item) =>
            item.product_id === product.id
              ? { ...item, quantity: newQty, stock: availableStock }
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
          quantity: Math.min(quantityToAdd, availableStock),
          seller_id: product.seller_id,
          stock: availableStock,
        };

        return [...prev, newItem];
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => item.product_id !== productId && item.id !== productId
      )
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) =>
        prev.filter(
          (item) => item.product_id !== productId && item.id !== productId
        )
      );
    } else {
      setItems((prev) =>
        prev.map((item) => {
          if (item.product_id === productId || item.id === productId) {
            const maxStock =
              typeof item.stock === "number" && item.stock > 0
                ? item.stock
                : 99;
            const cappedQty = Math.min(quantity, maxStock);
            return { ...item, quantity: cappedQty };
          }
          return item;
        })
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
