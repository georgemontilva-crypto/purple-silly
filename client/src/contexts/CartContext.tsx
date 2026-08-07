import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

/**
 * One line in the cart.
 *
 * Money is in CENTS, as an integer, everywhere. The catalog stores
 * priceCents and so does this; converting to a float on the way in would
 * mean 0.1 + 0.2 arithmetic deciding what a customer is charged. The only
 * place a decimal appears is the moment a total is formatted for display.
 *
 * The identity of a line is productId + variantId + bundleId, not the
 * variant alone: the same flavour bought as a single and as a 3-pack are
 * different things at different prices, and merging them would silently
 * change what someone is buying.
 */
export interface CartLine {
  /** Stable key derived from the identity triple — see lineKey(). */
  id: string;
  productId: number;
  variantId: number | null;
  bundleId: number | null;
  title: string;
  /** Flavour, e.g. "Blue Razz". Null when the product has no variants. */
  variantTitle: string | null;
  /** Pack, e.g. "3-Pack". Null when the product isn't sold in bundles. */
  bundleLabel: string | null;
  unitPriceCents: number;
  quantity: number;
  slug: string;
  imageUrl: string | null;
}

export interface AddToCartInput {
  productId: number;
  variantId?: number | null;
  bundleId?: number | null;
  title: string;
  variantTitle?: string | null;
  bundleLabel?: string | null;
  unitPriceCents: number;
  slug: string;
  imageUrl?: string | null;
  quantity?: number;
}

interface CartContextValue {
  lines: CartLine[];
  totalQuantity: number;
  /** Sum of every line, in cents. */
  subtotalCents: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (input: AddToCartInput) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Bumped from fw_cart_v2. The line shape changed — string prices became
 * integer cents and the identity gained productId and bundleId — so a v2
 * cart left in someone's browser would deserialise into lines with
 * NaN totals. A new key lets those simply be ignored.
 */
const CART_KEY = "purple_cart_v3";

/** Identity of a line. Same triple = same line. */
function lineKey(
  productId: number,
  variantId: number | null,
  bundleId: number | null
): string {
  return `${productId}:${variantId ?? "-"}:${bundleId ?? "-"}`;
}

/**
 * Reads the saved cart, discarding anything that isn't a well-formed line.
 * localStorage is user-writable and survives deploys, so this is the one
 * place a malformed or outdated entry can enter the app — it gets filtered
 * here rather than crashing a render somewhere downstream.
 */
function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is CartLine =>
        !!l &&
        typeof l === "object" &&
        typeof (l as CartLine).id === "string" &&
        typeof (l as CartLine).productId === "number" &&
        Number.isFinite((l as CartLine).unitPriceCents) &&
        Number.isFinite((l as CartLine).quantity) &&
        (l as CartLine).quantity > 0
    );
  } catch {
    // Private mode, quota, corrupt JSON — an empty cart is the safe answer.
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => loadCart());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable — the cart still works for this session */
    }
  }, [lines]);

  const addItem = useCallback((input: AddToCartInput) => {
    const variantId = input.variantId ?? null;
    const bundleId = input.bundleId ?? null;
    const id = lineKey(input.productId, variantId, bundleId);
    const quantity = Math.max(1, Math.round(input.quantity ?? 1));

    setLines(prev => {
      const existing = prev.find(l => l.id === id);
      if (existing) {
        // Same product, flavour and pack — one line, more of it.
        return prev.map(l =>
          l.id === id ? { ...l, quantity: l.quantity + quantity } : l
        );
      }
      return [
        ...prev,
        {
          id,
          productId: input.productId,
          variantId,
          bundleId,
          title: input.title,
          variantTitle: input.variantTitle ?? null,
          bundleLabel: input.bundleLabel ?? null,
          unitPriceCents: input.unitPriceCents,
          quantity,
          slug: input.slug,
          imageUrl: input.imageUrl ?? null,
        },
      ];
    });

    setIsOpen(true);
    toast.success("Added to cart");
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    // Dropping to zero removes the line: a stepper that bottoms out at 1
    // leaves no way to remove an item with the control you're already using.
    if (quantity <= 0) {
      setLines(prev => prev.filter(l => l.id !== id));
      return;
    }
    setLines(prev => prev.map(l => (l.id === id ? { ...l, quantity } : l)));
  }, []);

  const removeItem = useCallback((id: string) => {
    setLines(prev => prev.filter(l => l.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { totalQuantity, subtotalCents } = useMemo(
    () => ({
      totalQuantity: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotalCents: lines.reduce(
        (sum, l) => sum + l.unitPriceCents * l.quantity,
        0
      ),
    }),
    [lines]
  );

  const value: CartContextValue = {
    lines,
    totalQuantity,
    subtotalCents,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem,
    updateQuantity,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/** Cents to a display string. The one place money becomes a decimal. */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
