"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { Cart } from "@/types";

interface CartContextType {
  cart: Cart | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalQuantity: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
  initialCart?: Cart | null;
}

export function CartProvider({ children, initialCart }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(initialCart || null);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    async (productId: string, quantity: number = 1) => {
      try {
        const { addToCart } = await import("@/lib/actions/cart");
        const result = await addToCart(productId, quantity);
        if (result.success) {
          // Refresh cart
          const { getCart } = await import("@/lib/actions/cart");
          const cartResult = await getCart();
          if (cartResult.success && cartResult.data) {
            setCart(cartResult.data);
          }
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Failed to add item:", error);
      }
    },
    []
  );

  const removeItem = useCallback(async (cartItemId: string) => {
    try {
      const { removeFromCart } = await import("@/lib/actions/cart");
      const result = await removeFromCart(cartItemId);
      if (result.success) {
        setCart((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.filter((item) => item.id !== cartItemId),
          };
        });
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  }, []);

  const updateItemQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      try {
        const { updateCartItem } = await import("@/lib/actions/cart");
        const result = await updateCartItem(cartItemId, quantity);
        if (result.success) {
          setCart((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              items: prev.items.map((item) =>
                item.id === cartItemId ? { ...item, quantity } : item
              ),
            };
          });
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
      }
    },
    []
  );

  const clearCart = useCallback(async () => {
    try {
      const { clearCart: clearCartAction } = await import("@/lib/actions/cart");
      const result = await clearCartAction();
      if (result.success) {
        setCart((prev) => (prev ? { ...prev, items: [] } : prev));
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }, []);

  const totalQuantity = useMemo(() => {
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalAmount = useMemo(() => {
    if (!cart) return 0;
    return cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        totalQuantity,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
