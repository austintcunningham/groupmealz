"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  emptyCateringCart,
  type CateringCartLine,
  type CateringCartState,
  type CateringEventDetails,
} from "@/lib/catering/cart-types";

const STORAGE_KEY = "gm_catering_cart_v1";

type CateringCartContextValue = {
  cart: CateringCartState;
  itemCount: number;
  subtotalCents: number;
  servesTotal: number;
  deliveryFeeCents: number;
  totalCents: number;
  meetsMinimum: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  setRestaurant: (args: {
    restaurantId: string;
    restaurantSlug: string;
    restaurantName: string;
    liveOrders: boolean;
    minOrderCents: number | null;
    deliveryFeeCents: number;
    leadHours: number;
  }) => void;
  setEvent: (patch: Partial<CateringEventDetails>) => void;
  addLine: (line: Omit<CateringCartLine, "key"> & { key?: string }) => void;
  updateQty: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
};

const CateringCartContext = createContext<CateringCartContextValue | null>(null);

function loadStored(): CateringCartState {
  if (typeof window === "undefined") return emptyCateringCart();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCateringCart();
    return { ...emptyCateringCart(), ...JSON.parse(raw) } as CateringCartState;
  } catch {
    return emptyCateringCart();
  }
}

export function CateringCartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CateringCartState>(emptyCateringCart);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setCart(loadStored());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const setRestaurant = useCallback(
    (args: {
      restaurantId: string;
      restaurantSlug: string;
      restaurantName: string;
      liveOrders: boolean;
      minOrderCents: number | null;
      deliveryFeeCents: number;
      leadHours: number;
    }) => {
      setCart((prev) => {
        if (prev.restaurantId && prev.restaurantId !== args.restaurantId && prev.lines.length) {
          return {
            ...emptyCateringCart(),
            ...args,
            event: prev.event,
            lines: [],
          };
        }
        return { ...prev, ...args };
      });
    },
    []
  );

  const setEvent = useCallback((patch: Partial<CateringEventDetails>) => {
    setCart((prev) => ({ ...prev, event: { ...prev.event, ...patch } }));
  }, []);

  const addLine = useCallback(
    (line: Omit<CateringCartLine, "key"> & { key?: string }) => {
      const key =
        line.key ??
        `${line.menuItemId}:${line.specialInstructions.trim() || "_"}`;
      setCart((prev) => {
        const existing = prev.lines.find((l) => l.key === key);
        if (existing) {
          return {
            ...prev,
            lines: prev.lines.map((l) =>
              l.key === key
                ? { ...l, quantity: l.quantity + line.quantity }
                : l
            ),
          };
        }
        return {
          ...prev,
          lines: [...prev.lines, { ...line, key }],
        };
      });
      setDrawerOpen(true);
    },
    []
  );

  const updateQty = useCallback((key: string, quantity: number) => {
    setCart((prev) => ({
      ...prev,
      lines:
        quantity <= 0
          ? prev.lines.filter((l) => l.key !== key)
          : prev.lines.map((l) => (l.key === key ? { ...l, quantity } : l)),
    }));
  }, []);

  const removeLine = useCallback((key: string) => {
    setCart((prev) => ({
      ...prev,
      lines: prev.lines.filter((l) => l.key !== key),
    }));
  }, []);

  const clearCart = useCallback(() => setCart(emptyCateringCart()), []);

  const subtotalCents = useMemo(
    () => cart.lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0),
    [cart.lines]
  );
  const servesTotal = useMemo(
    () =>
      cart.lines.reduce(
        (s, l) => s + (l.servesEach ?? 0) * l.quantity,
        0
      ),
    [cart.lines]
  );
  const deliveryFeeCents =
    cart.event.fulfillment === "delivery" ? cart.deliveryFeeCents : 0;
  const totalCents = subtotalCents + deliveryFeeCents;
  const meetsMinimum =
    cart.minOrderCents == null || subtotalCents >= cart.minOrderCents;
  const itemCount = cart.lines.reduce((s, l) => s + l.quantity, 0);

  const value: CateringCartContextValue = {
    cart,
    itemCount,
    subtotalCents,
    servesTotal,
    deliveryFeeCents,
    totalCents,
    meetsMinimum,
    drawerOpen,
    setDrawerOpen,
    setRestaurant,
    setEvent,
    addLine,
    updateQty,
    removeLine,
    clearCart,
  };

  return (
    <CateringCartContext.Provider value={value}>
      {children}
    </CateringCartContext.Provider>
  );
}

export function useCateringCart() {
  const ctx = useContext(CateringCartContext);
  if (!ctx) throw new Error("useCateringCart requires CateringCartProvider");
  return ctx;
}
