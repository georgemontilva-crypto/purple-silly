import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

// Local cart item type (managed in React state and persisted to localStorage)
export interface CartLine {
  id: string; // local UUID
  variantId: string;
  title: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  image?: { url: string; altText: string | null } | null;
}

interface CartContextValue {
  lines: CartLine[];
  totalQuantity: number;
  subtotal: number;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number, meta?: { title?: string; variantTitle?: string; price?: { amount: string; currencyCode: string }; image?: { url: string; altText: string | null } | null }) => void;
  updateItem: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  goToCheckout: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "fw_cart_v2";

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => loadCart());
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Persist cart to localStorage on every change
  useEffect(() => { saveCart(lines); }, [lines]);

  const addItem = useCallback((
    variantId: string,
    quantity = 1,
    meta?: { title?: string; variantTitle?: string; price?: { amount: string; currencyCode: string }; image?: { url: string; altText: string | null } | null }
  ) => {
    setLines(prev => {
      const existing = prev.find(l => l.variantId === variantId);
      if (existing) {
        return prev.map(l => l.variantId === variantId ? { ...l, quantity: l.quantity + quantity } : l);
      }
      const newLine: CartLine = {
        id: `${Date.now()}-${Math.random()}`,
        variantId,
        title: meta?.title ?? "Product",
        variantTitle: meta?.variantTitle ?? "Default",
        price: meta?.price ?? { amount: "0", currencyCode: "USD" },
        quantity,
        image: meta?.image ?? null,
      };
      return [...prev, newLine];
    });
    setIsOpen(true);
    toast.success("Added to cart!");
  }, []);

  const updateItem = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setLines(prev => prev.filter(l => l.id !== id));
    } else {
      setLines(prev => prev.map(l => l.id === id ? { ...l, quantity } : l));
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
  }, []);

  // TODO(fase pagos): crear una orden local con estado "pending_payment" en
  // vez de este stub. El checkout nunca debe redirigir a un servicio externo.
  const goToCheckout = useCallback(async () => {
    if (lines.length === 0) return;
    toast.info("Checkout is coming soon.");
  }, [lines]);

  const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + parseFloat(l.price.amount) * l.quantity, 0);

  const value: CartContextValue = {
    lines,
    totalQuantity,
    subtotal,
    isLoading,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem,
    updateItem,
    removeItem,
    goToCheckout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
