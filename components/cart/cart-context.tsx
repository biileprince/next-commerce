"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import { Cart, Product } from "@/types";

interface CartContextType {
  cart: Cart | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (
    product: Product,
    quantity?: number,
  ) => Promise<{ success: boolean; error?: string }>;
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

const GUEST_CART_KEY = "guest-cart";

function persistGuestCart(cart: Cart | null) {
  if (typeof window === "undefined") return;

  if (!cart || cart.userId !== "guest") {
    localStorage.removeItem(GUEST_CART_KEY);
    return;
  }

  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

export function CartProvider({ children, initialCart }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(initialCart || null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (initialCart) {
      localStorage.removeItem(GUEST_CART_KEY);
      return;
    }

    const storedCart = localStorage.getItem(GUEST_CART_KEY);
    if (!storedCart) return;

    try {
      setCart(JSON.parse(storedCart) as Cart);
    } catch {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  }, [initialCart]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    async (product: Product, quantity: number = 1) => {
      try {
        const { addToCart } = await import("@/lib/actions/cart");
        const result = await addToCart(product.id, quantity);

        if (!result.success && result.error === "Unauthorized") {
          setCart((prev) => {
            const guestCart: Cart =
              prev && prev.userId === "guest"
                ? prev
                : {
                    id: "guest-cart",
                    userId: "guest",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    items: [],
                  };

            const existingItem = guestCart.items.find(
              (item) => item.productId === product.id,
            );

            if (existingItem) {
              const updatedCart: Cart = {
                ...guestCart,
                updatedAt: new Date(),
                items: guestCart.items.map((item) =>
                  item.productId === product.id
                    ? {
                        ...item,
                        quantity: Math.min(
                          item.quantity + quantity,
                          product.stockQuantity,
                        ),
                        updatedAt: new Date(),
                      }
                    : item,
                ),
              };

              persistGuestCart(updatedCart);
              return updatedCart;
            }

            const newItem = {
              id: `guest-${product.id}`,
              cartId: "guest-cart",
              productId: product.id,
              quantity: Math.min(quantity, product.stockQuantity),
              createdAt: new Date(),
              updatedAt: new Date(),
              product,
            };

            const updatedCart: Cart = {
              ...guestCart,
              updatedAt: new Date(),
              items: [...guestCart.items, newItem],
            };

            persistGuestCart(updatedCart);
            return updatedCart;
          });

          setIsOpen(true);
          return { success: true };
        }

        if (result.success) {
          // Refresh cart
          const { getCart } = await import("@/lib/actions/cart");
          const cartResult = await getCart();
          if (cartResult.success && cartResult.data) {
            setCart(cartResult.data);
            localStorage.removeItem(GUEST_CART_KEY);
          }
          setIsOpen(true);
          return { success: true };
        }

        return { success: false, error: result.error ?? "Failed to add item" };
      } catch (error) {
        console.error("Failed to add item:", error);
        return { success: false, error: "Failed to add item" };
      }
    },
    [],
  );

  const removeItem = useCallback(async (cartItemId: string) => {
    if (cart?.userId === "guest") {
      setCart((prev) => {
        if (!prev) return prev;
        const updatedCart: Cart = {
          ...prev,
          updatedAt: new Date(),
          items: prev.items.filter((item) => item.id !== cartItemId),
        };
        persistGuestCart(updatedCart.items.length ? updatedCart : null);
        return updatedCart.items.length ? updatedCart : null;
      });
      return;
    }

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
  }, [cart?.userId]);

  const updateItemQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (cart?.userId === "guest") {
        setCart((prev) => {
          if (!prev) return prev;

          const updatedCart: Cart = {
            ...prev,
            updatedAt: new Date(),
            items: prev.items.map((item) =>
              item.id === cartItemId
                ? {
                    ...item,
                    quantity: Math.max(
                      1,
                      Math.min(quantity, item.product.stockQuantity),
                    ),
                    updatedAt: new Date(),
                  }
                : item,
            ),
          };

          persistGuestCart(updatedCart);
          return updatedCart;
        });
        return;
      }

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
    [cart?.userId],
  );

  const clearCart = useCallback(async () => {
    if (cart?.userId === "guest") {
      setCart(null);
      persistGuestCart(null);
      return;
    }

    try {
      const { clearCart: clearCartAction } = await import("@/lib/actions/cart");
      const result = await clearCartAction();
      if (result.success) {
        setCart((prev) => (prev ? { ...prev, items: [] } : prev));
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }, [cart?.userId]);

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
