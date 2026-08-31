/**
 * THE ZIMBABWEAN TABLE — domain model + demo seed data.
 * Pure data layer: no UI, no side effects. All demo content is clearly
 * labelled as demonstration data for the competition showcase.
 */

import expSadza from "@/assets/exp-sadza.jpg";
import expFarm from "@/assets/exp-farm.jpg";
import expMarket from "@/assets/exp-market.jpg";
import expCooking from "@/assets/exp-cooking.jpg";
import expChef from "@/assets/exp-chef.jpg";

export type Role = "tourist" | "hospitality" | "farmer";

export type CategoryId =
  | "traditional"
  | "farm-to-table"
  | "heritage"
  | "markets"
  | "rural"
  | "cooking"
  | "chef"
  | "street"
  | "seasonal"
  | "dessert";

export type Category = { id: CategoryId; label: string; emoji: string };

export const CATEGORIES: Category[] = [
  { id: "traditional", label: "Traditional Dishes", emoji: "🍲" },
  { id: "farm-to-table", label: "Farm-to-Table", emoji: "🌾" },
  { id: "heritage", label: "Heritage Food", emoji: "🪘" },
  { id: "markets", label: "Local Markets", emoji: "🧺" },
  { id: "rural", label: "Rural Experiences", emoji: "🏞️" },
  { id: "cooking", label: "Cooking Experiences", emoji: "🔥" },
  { id: "chef", label: "Chef Experiences", emoji: "👩🏾‍🍳" },
  { id: "street", label: "Street Food", emoji: "🥟" },
  { id: "seasonal", label: "Seasonal", emoji: "🌦️" },
  { id: "dessert", label: "Zimbabwean Desserts", emoji: "🍮" },
];

export type Dish = {
  name: string;
  description: string;
  ingredients: string[];
};

export type Experience = {
  id: string;
  name: string;
  host: string;
  business: string;
  city: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  durationMins: number;
  categories: CategoryId[];
  image: string;
  tagline: string;
  story: string;
  includes: string[];
  dishes: Dish[];
  keyDish: string;
  producerId: string;
  authenticity: "Community verified" | "Heritage listed" | "Chef curated";
  status: "Available today" | "2 slots left" | "Seasonal — Nov to Mar";
  points: number;
  heritage?: { title: string; significance: string; preparation: string; regional: string; serving: string };
};

export const EXPERIENCES: Experience[] = [
  {
    id: "sadza-goat",
    name: "Traditional Sadza & Goat Experience",
    host: "Mai Rudo",
    business: "Demo — Pamuzinda Eatery",
    city: "Harare",
    location: "Avondale, Harare",
    price: 18,
    rating: 4.9,
    reviews: 128,
    durationMins: 120,
    categories: ["traditional", "heritage"],
    image: expSadza,
    tagline: "Taste a traditional Zimbabwean meal while learning its cultural history.",
    story:
      "Sadza is the centre of the Zimbabwean table. In this experience your host cooks over an open fire, explains how the meal is shared from one plate, and walks you through the etiquette that has framed family meals for generations.",
    includes: [
      "Fireside cooking demonstration",
      "Full traditional meal served family-style",
      "Story of the dish told by your host",
      "Tea and seasonal fruit to close",
    ],
    dishes: [
      {
        name: "Sadza rezviyo with goat stew",
        description: "Finger-millet sadza with slow-simmered goat and tomato-onion gravy.",
        ingredients: ["Finger millet meal", "Goat", "Tomatoes", "Onion", "Groundnut oil"],
      },
      {
        name: "Muriwo une dovi",
        description: "Leafy greens simmered in groundnut butter.",
        ingredients: ["Covo greens", "Groundnuts", "Salt"],
      },
    ],
    keyDish: "Sadza rezviyo with goat stew",
    producerId: "farmer-chikomba",
    authenticity: "Heritage listed",
    status: "Available today",
    points: 150,
    heritage: {
      title: "Sadza",
      significance:
        "Sadza is the staple of most Zimbabwean households and anchors both everyday meals and ceremonies. Sharing it from a common plate signals hospitality and belonging.",
      preparation:
        "Maize or finger-millet meal is stirred into boiling water, cooked slowly and thickened until it holds shape when scooped.",
      regional:
        "Sadza rezviyo (finger millet) and sadza remhunga (pearl millet) are common in drier regions, while white maize sadza is widespread in towns.",
      serving:
        "Traditionally eaten by hand with a relish of greens, beans, meat or fish. Guests are usually served first.",
    },
  },
  {
    id: "farm-table-msasa",
    name: "Msasa Tree Farm-to-Table Lunch",
    host: "Tendai & family",
    business: "Demo — Msasa Farm Kitchen",
    city: "Harare",
    location: "Ruwa smallholding, 25 min from Harare",
    price: 24,
    rating: 4.8,
    reviews: 74,
    durationMins: 180,
    categories: ["farm-to-table", "rural", "seasonal"],
    image: expFarm,
    tagline: "Harvest in the morning, eat at a long table under the msasa trees.",
    story:
      "This working smallholding supplies butternut and leafy greens to Harare kitchens. Guests walk the beds, pick what is ready that week, then eat a menu built entirely from that harvest.",
    includes: ["Guided harvest walk", "Four-course seasonal lunch", "Meet the growing team", "Seed and season talk"],
    dishes: [
      {
        name: "Roasted butternut with local herbs",
        description: "Butternut picked that morning, roasted with wild herbs and honey.",
        ingredients: ["Butternut", "Wild herbs", "Honey"],
      },
      {
        name: "Open-fire maize and bean stew",
        description: "Fresh maize and sugar beans cooked slowly over coals.",
        ingredients: ["Green maize", "Sugar beans", "Tomatoes", "Onion"],
      },
    ],
    keyDish: "Roasted butternut with local herbs",
    producerId: "farmer-ruwa",
    authenticity: "Community verified",
    status: "2 slots left",
    points: 180,
  },
  {
    id: "mbare-market",
    name: "Mbare Market Tasting Walk",
    host: "Kuda",
    business: "Demo — Table Walks Harare",
    city: "Harare",
    location: "Mbare, Harare",
    price: 12,
    rating: 4.7,
    reviews: 203,
    durationMins: 90,
    categories: ["markets", "street", "traditional"],
    image: expMarket,
    tagline: "Meet growers and taste your way through Zimbabwe's busiest produce market.",
    story:
      "A guided walk through the stalls where much of Harare's produce arrives each morning. You meet traders, taste street favourites, and learn how seasons move prices.",
    includes: ["Guided market walk", "Five street tastings", "Producer introductions", "Ingredient glossary"],
    dishes: [
      {
        name: "Maputi and roasted groundnuts",
        description: "Popped maize and fresh roasted groundnuts, the classic market snack.",
        ingredients: ["Maize", "Groundnuts", "Salt"],
      },
    ],
    keyDish: "Maputi and roasted groundnuts",
    producerId: "farmer-chikomba",
    authenticity: "Community verified",
    status: "Available today",
    points: 90,
  },
  {
    id: "fireside-cooking",
    name: "Fireside Sadza Cooking Class",
    host: "Gogo Chipo",
    business: "Demo — Chipo's Kitchen",
    city: "Bulawayo",
    location: "Hillside, Bulawayo",
    price: 28,
    rating: 4.9,
    reviews: 96,
    durationMins: 150,
    categories: ["cooking", "heritage", "traditional"],
    image: expCooking,
    tagline: "Learn to cook sadza, greens and relish over a wood fire.",
    story:
      "A hands-on class in a traditional kitchen. You grind, stir and taste, then sit down to eat what you cooked while your host shares proverbs tied to each ingredient.",
    includes: ["Hands-on cooking", "Recipe cards to take home", "Shared meal", "Proverbs and food language"],
    dishes: [
      {
        name: "Sadza with mopane worm relish",
        description: "A regional delicacy: dried mopane worms rehydrated and fried with onion and tomato.",
        ingredients: ["Mopane worms", "Onion", "Tomatoes", "Maize meal"],
      },
    ],
    keyDish: "Sadza with mopane worm relish",
    producerId: "farmer-matobo",
    authenticity: "Heritage listed",
    status: "Seasonal — Nov to Mar",
    points: 200,
  },
  {
    id: "chefs-table",
    name: "Indigenous Ingredients Chef's Table",
    host: "Chef Nyasha",
    business: "Demo — Table 263",
    city: "Victoria Falls",
    location: "Victoria Falls town",
    price: 45,
    rating: 4.8,
    reviews: 58,
    durationMins: 165,
    categories: ["chef", "seasonal", "dessert"],
    image: expChef,
    tagline: "A modern tasting menu built from indigenous Zimbabwean ingredients.",
    story:
      "Seven courses that reinterpret familiar Zimbabwean flavours — baobab, finger millet, wild honey — using produce delivered by nearby growers that week.",
    includes: ["Seven-course tasting menu", "Producer provenance card", "Baobab dessert", "Chef conversation"],
    dishes: [
      {
        name: "Baobab and wild honey cream",
        description: "Tart baobab folded through cream with wild honey and millet crumb.",
        ingredients: ["Baobab", "Wild honey", "Finger millet", "Cream"],
      },
    ],
    keyDish: "Baobab and wild honey cream",
    producerId: "farmer-hwange",
    authenticity: "Chef curated",
    status: "2 slots left",
    points: 250,
  },
];

export type FarmerProfile = {
  id: string;
  name: string;
  farm: string;
  location: string;
  since: number;
};

export const FARMERS: FarmerProfile[] = [
  { id: "farmer-ruwa", name: "Demo — Tendai M.", farm: "Ruwa Green Beds", location: "Ruwa, Mashonaland East", since: 2016 },
  { id: "farmer-chikomba", name: "Demo — Rudo N.", farm: "Chikomba Family Farm", location: "Chikomba, Mashonaland East", since: 2011 },
  { id: "farmer-matobo", name: "Demo — Sipho D.", farm: "Matobo Dryland Growers", location: "Matobo, Matabeleland South", since: 2019 },
  { id: "farmer-hwange", name: "Demo — Farai K.", farm: "Zambezi Fresh Collective", location: "Hwange, Matabeleland North", since: 2020 },
];

export const ACTIVE_FARMER_ID = "farmer-ruwa";

export type ProduceStatus = "available" | "seasonal" | "low" | "out";

export type Produce = {
  id: string;
  name: string;
  category: "Vegetables" | "Grains" | "Protein" | "Indigenous" | "Fruit";
  farmerId: string;
  quantity: number;
  unit: "kg" | "crate" | "bunch";
  price: number;
  harvest: string;
  status: ProduceStatus;
  location: string;
  description: string;
  emoji: string;
};

export const PRODUCE: Produce[] = [
  {
    id: "p-mushrooms",
    name: "Fresh Mushrooms",
    category: "Vegetables",
    farmerId: "farmer-ruwa",
    quantity: 20,
    unit: "kg",
    price: 4.5,
    harvest: "Current season — after the rains",
    status: "available",
    location: "Ruwa",
    description: "Oyster mushrooms grown in shade houses, picked to order.",
    emoji: "🍄",
  },
  {
    id: "p-butternut",
    name: "Butternut",
    category: "Vegetables",
    farmerId: "farmer-ruwa",
    quantity: 50,
    unit: "kg",
    price: 1.2,
    harvest: "Current season",
    status: "available",
    location: "Ruwa",
    description: "Dense, sweet butternut suited to roasting and purées.",
    emoji: "🎃",
  },
  {
    id: "p-greens",
    name: "Covo & Rape Greens",
    category: "Vegetables",
    farmerId: "farmer-ruwa",
    quantity: 40,
    unit: "bunch",
    price: 0.6,
    harvest: "Weekly cut",
    status: "available",
    location: "Ruwa",
    description: "Leafy greens cut the morning of delivery.",
    emoji: "🥬",
  },
  {
    id: "p-tomatoes",
    name: "Tomatoes",
    category: "Vegetables",
    farmerId: "farmer-chikomba",
    quantity: 8,
    unit: "crate",
    price: 9,
    harvest: "Current season",
    status: "low",
    location: "Chikomba",
    description: "Field tomatoes, graded for kitchens.",
    emoji: "🍅",
  },
  {
    id: "p-maize",
    name: "Green Maize",
    category: "Grains",
    farmerId: "farmer-chikomba",
    quantity: 120,
    unit: "kg",
    price: 0.8,
    harvest: "Feb — Apr",
    status: "seasonal",
    location: "Chikomba",
    description: "Fresh green maize for boiling, roasting and stews.",
    emoji: "🌽",
  },
  {
    id: "p-mopane",
    name: "Mopane Worms",
    category: "Indigenous",
    farmerId: "farmer-matobo",
    quantity: 15,
    unit: "kg",
    price: 12,
    harvest: "Nov — Mar",
    status: "seasonal",
    location: "Matobo",
    description: "Sun-dried madora, a protein-rich regional delicacy.",
    emoji: "🪲",
  },
  {
    id: "p-fish",
    name: "Fresh Kapenta & Bream",
    category: "Protein",
    farmerId: "farmer-hwange",
    quantity: 30,
    unit: "kg",
    price: 6.5,
    harvest: "Current season",
    status: "available",
    location: "Zambezi valley",
    description: "Lake-caught fish delivered on ice.",
    emoji: "🐟",
  },
  {
    id: "p-baobab",
    name: "Baobab Powder",
    category: "Indigenous",
    farmerId: "farmer-hwange",
    quantity: 25,
    unit: "kg",
    price: 8,
    harvest: "May — Sep",
    status: "available",
    location: "Hwange",
    description: "Wild-harvested baobab, tart and citrus-like.",
    emoji: "🥥",
  },
  {
    id: "p-groundnuts",
    name: "Groundnuts",
    category: "Grains",
    farmerId: "farmer-chikomba",
    quantity: 60,
    unit: "kg",
    price: 2.2,
    harvest: "Current season",
    status: "available",
    location: "Chikomba",
    description: "Shelled groundnuts for dovi (peanut butter) relishes.",
    emoji: "🥜",
  },
];

export type HospitalityBusiness = {
  id: string;
  name: string;
  type: string;
  city: string;
  style: string;
};

export const BUSINESS: HospitalityBusiness = {
  id: "biz-demo-hotel",
  name: "Demo — Zambezi House Hotel",
  type: "Boutique hotel & restaurant",
  city: "Harare",
  style: "Contemporary Zimbabwean",
};

export type OrderStatus = "new" | "accepted" | "ready" | "delivered" | "completed";

export const ORDER_FLOW: OrderStatus[] = ["new", "accepted", "ready", "delivered", "completed"];

export const ORDER_LABEL: Record<OrderStatus, string> = {
  new: "New",
  accepted: "Accepted",
  ready: "Ready for delivery",
  delivered: "Delivered",
  completed: "Completed",
};

export type OrderItem = { produceId: string; name: string; quantity: number; unit: string; price: number };

export type Order = {
  id: string;
  businessName: string;
  farmerId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  note?: string;
  declined?: boolean;
};

export const SEED_ORDERS: Order[] = [
  {
    id: "ord-1001",
    businessName: "Demo — Meikles Garden Restaurant",
    farmerId: "farmer-ruwa",
    items: [{ produceId: "p-greens", name: "Covo & Rape Greens", quantity: 25, unit: "bunch", price: 0.6 }],
    total: 15,
    status: "accepted",
    createdAt: "Yesterday, 08:10",
    note: "Weekly standing order.",
  },
  {
    id: "ord-1002",
    businessName: "Demo — Zambezi House Hotel",
    farmerId: "farmer-ruwa",
    items: [{ produceId: "p-butternut", name: "Butternut", quantity: 30, unit: "kg", price: 1.2 }],
    total: 36,
    status: "ready",
    createdAt: "Today, 06:45",
  },
  {
    id: "ord-1003",
    businessName: "Demo — Table 263",
    farmerId: "farmer-ruwa",
    items: [{ produceId: "p-mushrooms", name: "Fresh Mushrooms", quantity: 6, unit: "kg", price: 4.5 }],
    total: 27,
    status: "completed",
    createdAt: "Mon, 15:20",
  },
];

export type Tier = "Bronze" | "Silver" | "Gold" | "Platinum";

export const TIERS: { tier: Tier; min: number; benefits: string[] }[] = [
  { tier: "Bronze", min: 0, benefits: ["Base earning on every experience", "Access to all partner tables"] },
  {
    tier: "Silver",
    min: 1000,
    benefits: ["Early access to new partners", "Birthday bonus points", "5% off partner meals"],
  },
  {
    tier: "Gold",
    min: 2500,
    benefits: ["Complimentary beverage with meals", "10% off partner meals", "Priority seasonal experiences"],
  },
  {
    tier: "Platinum",
    min: 5000,
    benefits: ["VIP chef's table experience", "Custom printed culinary cookbook", "Farm-to-table invitations"],
  },
];

export function tierFor(points: number): Tier {
  return [...TIERS].reverse().find((t) => points >= t.min)!.tier;
}

export function nextTier(points: number) {
  return TIERS.find((t) => t.min > points) ?? null;
}

export type Reward = {
  id: string;
  name: string;
  cost: number;
  detail: string;
  tier: Tier;
  emoji: string;
};

export const REWARDS: Reward[] = [
  { id: "r-meal", name: "Traditional meal for two", cost: 800, detail: "Redeem at any partner table.", tier: "Bronze", emoji: "🍲" },
  { id: "r-farm", name: "Farm-to-table experience", cost: 1500, detail: "Harvest lunch on a partner smallholding.", tier: "Silver", emoji: "🌾" },
  { id: "r-class", name: "Cooking class with a host", cost: 2200, detail: "Hands-on heritage cooking session.", tier: "Silver", emoji: "🔥" },
  { id: "r-chef", name: "Chef's table experience", cost: 3500, detail: "Tasting menu built from that week's harvest.", tier: "Gold", emoji: "👩🏾‍🍳" },
  { id: "r-book", name: "Custom Zimbabwe cookbook", cost: 5000, detail: "Hardcover record of your culinary journey.", tier: "Platinum", emoji: "📕" },
];

export type PassportStamp = { id: string; label: string; earned: boolean };

export const PASSPORT_SEED: PassportStamp[] = [
  { id: "harare", label: "Harare", earned: true },
  { id: "sadza", label: "Traditional Sadza", earned: false },
  { id: "farm", label: "Farm-to-table", earned: false },
  { id: "heritage", label: "Heritage Dish", earned: false },
  { id: "market", label: "Local Market", earned: false },
  { id: "class", label: "Cooking Class", earned: false },
];

export type DemandInsight = { label: string; change: number; detail: string };

export const DEMAND_INSIGHTS: DemandInsight[] = [
  { label: "Traditional cuisine interest", change: 24, detail: "Searches for sadza and heritage relishes rose this month." },
  { label: "Farm-to-table experiences", change: 18, detail: "Tourists are booking harvest lunches ahead of city dining." },
  { label: "Indigenous ingredients", change: 12, detail: "Baobab, millet and mopane appear more often in AI prompts." },
  { label: "Under $30 experiences", change: -4, detail: "Budget-tier demand steady, premium tastings growing faster." },
];

export const DEMAND_TREND = [
  { month: "Mar", traditional: 42, farm: 21 },
  { month: "Apr", traditional: 48, farm: 26 },
  { month: "May", traditional: 55, farm: 30 },
  { month: "Jun", traditional: 61, farm: 38 },
  { month: "Jul", traditional: 68, farm: 47 },
  { month: "Aug", traditional: 79, farm: 58 },
];

export const POPULAR_DISHES = [
  { dish: "Sadza & goat stew", searches: 1240 },
  { dish: "Muriwo une dovi", searches: 870 },
  { dish: "Mopane worm relish", searches: 610 },
  { dish: "Roast butternut", searches: 520 },
  { dish: "Kapenta with millet", searches: 410 },
];

export function money(n: number) {
  return `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;
}

export function duration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
}
