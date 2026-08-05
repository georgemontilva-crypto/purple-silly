import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  addToCart,
  createCart,
  getCart,
  isShopifyConfigured,
  removeCartLine,
  ShopifyCart,
  ShopifyCartLine,
  updateCartLine,
} from "@/lib/shopify";
import { toast } from "sonner";

interface CartContextValue {
  cart: ShopifyCart | null;
  cartId: string | null;
  totalQuantity: number;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  goToCheckout: () => void;
  lines: ShopifyCartLine[];
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_ID_KEY = "fw_shopify_cart_id";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize cart from localStorage
  useEffect(() => {
    if (!isShopifyConfigured()) return;
    const stored = localStorage.getItem(CART_ID_KEY);
    if (stored) {
      setCartId(stored);
      getCart(stored)
        .then((c) => { if (c) setCart(c); })
        .catch(() => localStorage.removeItem(CART_ID_KEY));
    }
  }, []);

  const ensureCart = useCallback(async (): Promise<string> => {
    if (cartId) return cartId;
    const newCart = await createCart();
    setCart(newCart);
    setCartId(newCart.id);
    localStorage.setItem(CART_ID_KEY, newCart.id);
    return newCart.id;
  }, [cartId]);

  const addItem = useCallback(async (merchandiseId: string, quantity = 1) => {
    if (!isShopifyConfigured()) {
      toast.info("Shopify not configured yet. Connect your store to enable purchasing.");
      return;
    }
    setIsLoading(true);
    try {
      const id = await ensureCart();
      const updated = await addToCart(id, [{ merchandiseId, quantity }]);
      setCart(updated);
      setIsOpen(true);
      toast.success("Added to cart!");
    } catch (e) {
      toast.error("Could not add to cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [ensureCart]);

  const updateItem = useCallback(async (lineId: string, quantity: number) => {
    if (!cartId) return;
    setIsLoading(true);
    try {
      const updated = await updateCartLine(cartId, lineId, quantity);
      setCart(updated);
    } catch {
      toast.error("Could not update cart.");
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  const removeItem = useCallback(async (lineId: string) => {
    if (!cartId) return;
    setIsLoading(true);
    try {
      const updated = await removeCartLine(cartId, lineId);
      setCart(updated);
    } catch {
      toast.error("Could not remove item.");
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  const goToCheckout = useCallback(() => {
    if (cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl;
    }
  }, [cart]);

  const value: CartContextValue = {
    cart,
    cartId,
    totalQuantity: cart?.totalQuantity ?? 0,
    isLoading,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem,
    updateItem,
    removeItem,
    goToCheckout,
    lines: cart?.lines.nodes ?? [],
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

