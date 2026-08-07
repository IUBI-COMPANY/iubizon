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
  company_id: string;
  stock?: number | null;
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
          company_id: string;
          images?: any[];
          stock?: number | null;
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
                const freshStock =
                  typeof data.product.stock === "number"
                    ? data.product.stock
                    : 0;
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
          }),
        );

        if (isMounted) {
          setItems((prev) => {
            let hasChanges = false;
            const updatedItems = prev.map((prevItem) => {
              const fresh = updated.find(
                (u) => u.product_id === prevItem.product_id,
              );
              if (fresh) {
                if (
                  prevItem.stock !== fresh.stock ||
                  prevItem.price !== fresh.price ||
                  prevItem.quantity !== fresh.quantity
                ) {
                  hasChanges = true;
                }
                return {
                  ...prevItem,
                  stock: fresh.stock,
                  price: fresh.price,
                  quantity: Math.min(prevItem.quantity, fresh.stock),
                };
              }
              return prevItem;
            });

            // Eliminar de forma automática productos que se hayan quedado sin stock
            const validItems = updatedItems.filter(
              (item) =>
                (item.stock === undefined ||
                  item.stock === null ||
                  item.stock > 0) &&
                item.quantity > 0,
            );

            if (validItems.length !== prev.length) {
              hasChanges = true;
            }

            return hasChanges ? validItems : prev;
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
            company_id: string;
            images?: any[];
            stock?: number | null;
          },
      quantityToAdd: number = 1,
    ) => {
      setItems((prev) => {
        const existingItem = prev.find(
          (item) => item.product_id === product.id,
        );

        const availableStock =
          typeof product.stock === "number"
            ? product.stock
            : typeof existingItem?.stock === "number"
              ? existingItem.stock
              : 10;

        if (availableStock <= 0) {
          return prev;
        }

        if (existingItem) {
          const newQty = Math.min(
            existingItem.quantity + quantityToAdd,
            availableStock,
          );
          if (newQty <= 0) {
            return prev.filter((item) => item.product_id !== product.id);
          }
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
          company_id: product.company_id,
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
        (item) => item.product_id !== productId && item.id !== productId,
      ),
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) =>
        prev.filter(
          (item) => item.product_id !== productId && item.id !== productId,
        ),
      );
    } else {
      setItems((prev) =>
        prev
          .map((item) => {
            if (item.product_id === productId || item.id === productId) {
              const maxStock = typeof item.stock === "number" ? item.stock : 99;
              if (maxStock <= 0) {
                return { ...item, quantity: 0 };
              }
              const cappedQty = Math.min(quantity, maxStock);
              return { ...item, quantity: cappedQty };
            }
            return item;
          })
          .filter(
            (item) =>
              (item.stock === undefined ||
                item.stock === null ||
                item.stock > 0) &&
              item.quantity > 0,
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
