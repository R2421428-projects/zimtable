/**
 * Application state for the ecosystem. One store so data flows between
 * tourist, hospitality and farmer views (produce -> menus -> orders -> points).
 * Persisted to localStorage so the presenter can move between roles freely.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  ACTIVE_FARMER_ID,
  BUSINESS,
  EXPERIENCES,
  ORDER_FLOW,
  PASSPORT_SEED,
  PRODUCE,
  SEED_ORDERS,
  tierFor,
  type Order,
  type OrderItem,
  type OrderStatus,
  type PassportStamp,
  type Produce,
  type Role,
} from "./domain";

export type PointsTx = { id: string; label: string; points: number; at: string };

export type SavedMenu = {
  id: string;
  title: string;
  season: string;
  createdAt: string;
  courses: { course: string; dish: string; description: string; produceUsed: string[]; price: number; culture: string }[];
};

export type AppState = {
  hydrated: boolean;
  onboarded: boolean;
  role: Role;
  points: number;
  transactions: PointsTx[];
  saved: string[];
  completed: string[];
  recentlyViewed: string[];
  passport: PassportStamp[];
  produce: Produce[];
  orders: Order[];
  menus: SavedMenu[];
  redeemed: string[];
  tastePrompts: string[];
};

const initialState: AppState = {
  hydrated: false,
  onboarded: false,
  role: "tourist",
  points: 850,
  transactions: [
    { id: "tx-seed-1", label: "Welcome to The Zimbabwean Table", points: 100, at: "On arrival" },
    { id: "tx-seed-2", label: "Mbare Market Tasting Walk completed", points: 90, at: "Yesterday" },
    { id: "tx-seed-3", label: "Reviewed Pamuzinda Eatery", points: 60, at: "Yesterday" },
    { id: "tx-seed-4", label: "#TasteOfZimbabwe photo shared", points: 100, at: "2 days ago" },
    { id: "tx-seed-5", label: "Heritage dish discovered: Muriwo une dovi", points: 500, at: "3 days ago" },
  ],
  saved: [],
  completed: ["mbare-market"],
  recentlyViewed: [],
  passport: PASSPORT_SEED,
  produce: PRODUCE,
  orders: SEED_ORDERS,
  menus: [],
  redeemed: [],
  tastePrompts: [],
};

type Action =
  | { type: "hydrate"; state: Partial<AppState> }
  | { type: "onboarded" }
  | { type: "role"; role: Role }
  | { type: "toggleSave"; id: string }
  | { type: "view"; id: string }
  | { type: "complete"; id: string; label: string; points: number; stamps: string[] }
  | { type: "award"; label: string; points: number; stamps?: string[] }
  | { type: "redeem"; id: string; cost: number; name: string }
  | { type: "saveMenu"; menu: SavedMenu }
  | { type: "upsertProduce"; produce: Produce }
  | { type: "placeOrder"; items: OrderItem[] }
  | { type: "orderStatus"; id: string; status: OrderStatus }
  | { type: "declineOrder"; id: string }
  | { type: "prompt"; text: string }
  | { type: "reset" };

function stamp(passport: PassportStamp[], ids: string[]) {
  if (!ids.length) return passport;
  return passport.map((p) => (ids.includes(p.id) ? { ...p, earned: true } : p));
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.state, hydrated: true };
    case "onboarded":
      return { ...state, onboarded: true };
    case "role":
      return { ...state, role: action.role };
    case "toggleSave":
      return {
        ...state,
        saved: state.saved.includes(action.id)
          ? state.saved.filter((i) => i !== action.id)
          : [action.id, ...state.saved],
      };
    case "view":
      return { ...state, recentlyViewed: [action.id, ...state.recentlyViewed.filter((i) => i !== action.id)].slice(0, 6) };
    case "complete": {
      if (state.completed.includes(action.id)) return state;
      return {
        ...state,
        completed: [action.id, ...state.completed],
        points: state.points + action.points,
        passport: stamp(state.passport, action.stamps),
        transactions: [
          { id: `tx-${Date.now()}`, label: action.label, points: action.points, at: "Just now" },
          ...state.transactions,
        ],
      };
    }
    case "award":
      return {
        ...state,
        points: state.points + action.points,
        passport: stamp(state.passport, action.stamps ?? []),
        transactions: [
          { id: `tx-${Date.now()}`, label: action.label, points: action.points, at: "Just now" },
          ...state.transactions,
        ],
      };
    case "redeem":
      if (state.points < action.cost || state.redeemed.includes(action.id)) return state;
      return {
        ...state,
        points: state.points - action.cost,
        redeemed: [action.id, ...state.redeemed],
        transactions: [
          { id: `tx-${Date.now()}`, label: `Redeemed: ${action.name}`, points: -action.cost, at: "Just now" },
          ...state.transactions,
        ],
      };
    case "saveMenu":
      return { ...state, menus: [action.menu, ...state.menus].slice(0, 8) };
    case "upsertProduce": {
      const exists = state.produce.some((p) => p.id === action.produce.id);
      return {
        ...state,
        produce: exists
          ? state.produce.map((p) => (p.id === action.produce.id ? action.produce : p))
          : [action.produce, ...state.produce],
      };
    }
    case "placeOrder": {
      const total = action.items.reduce((s, i) => s + i.price * i.quantity, 0);
      const farmerId = state.produce.find((p) => p.id === action.items[0]?.produceId)?.farmerId ?? ACTIVE_FARMER_ID;
      const order: Order = {
        id: `ord-${Date.now().toString().slice(-4)}`,
        businessName: BUSINESS.name,
        farmerId,
        items: action.items,
        total,
        status: "new",
        createdAt: "Just now",
        note: "Placed from the AI seasonal menu.",
      };
      return { ...state, orders: [order, ...state.orders] };
    }
    case "orderStatus": {
      const orders = state.orders.map((o) => (o.id === action.id ? { ...o, status: action.status } : o));
      let produce = state.produce;
      if (action.status === "delivered") {
        const order = state.orders.find((o) => o.id === action.id);
        if (order) {
          produce = state.produce.map((p) => {
            const item = order.items.find((i) => i.produceId === p.id);
            if (!item) return p;
            const quantity = Math.max(0, p.quantity - item.quantity);
            return { ...p, quantity, status: quantity === 0 ? "out" : quantity < 10 ? "low" : p.status };
          });
        }
      }
      return { ...state, orders, produce };
    }
    case "declineOrder":
      return { ...state, orders: state.orders.map((o) => (o.id === action.id ? { ...o, declined: true } : o)) };
    case "prompt":
      return { ...state, tastePrompts: [action.text, ...state.tastePrompts].slice(0, 8) };
    case "reset":
      return { ...initialState, hydrated: true, onboarded: false };
    default:
      return state;
  }
}

const KEY = "zim-table-state-v1";

type Ctx = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  tier: string;
  advanceOrder: (id: string) => void;
  savedExperiences: typeof EXPERIENCES;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      dispatch({ type: "hydrate", state: raw ? (JSON.parse(raw) as Partial<AppState>) : {} });
    } catch {
      dispatch({ type: "hydrate", state: {} });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...state, hydrated: undefined }));
    } catch {
      /* storage unavailable — demo still works in memory */
    }
  }, [state]);

  const advanceOrder = useCallback(
    (id: string) => {
      const order = state.orders.find((o) => o.id === id);
      if (!order) return;
      const next: OrderStatus =
        ORDER_FLOW[Math.min(ORDER_FLOW.indexOf(order.status) + 1, ORDER_FLOW.length - 1)] ?? "completed";
      dispatch({ type: "orderStatus", id, status: next });
    },
    [state.orders],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      dispatch,
      tier: tierFor(state.points),
      advanceOrder,
      savedExperiences: EXPERIENCES.filter((e) => state.saved.includes(e.id)),
    }),
    [state, advanceOrder],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
