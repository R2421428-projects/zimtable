/**
 * THE ZIMBABWEAN TABLE — Multi-source Places Engine
 * Aggregates data from multiple APIs + curated local database
 * for comprehensive Zimbabwe place coverage
 */

import { searchZimbabwePlaces, type FoursquarePlace } from "./foursquare.server";

// ============================================================================
// TYPES
// ============================================================================

export type PlaceCategory = 
  | "restaurant" 
  | "cafe" 
  | "market" 
  | "heritage_site" 
  | "accommodation"
  | "cultural_center"
  | "farm"
  | "attraction"
  | "activity";

export type ZimbabweRegion = 
  | "Harare"
  | "Bulawayo" 
  | "Victoria Falls"
  | "Mutare"
  | "Gweru"
  | "Masvingo"
  | "Chinhoyi"
  | "Kariba"
  | "Hwange"
  | "Nyanga";

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  location: {
    city: string;
    region: ZimbabweRegion;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  description?: string;
  heritage?: boolean;
  culture?: string[];
  verified: boolean;
  source: "foursquare" | "google" | "osm" | "curated" | "wikidata";
  rating?: number;
  priceRange?: "$" | "$$" | "$$$" | "$$$$";
  photos?: string[];
  contact?: {
    phone?: string;
    website?: string;
    email?: string;
  };
  hours?: string;
  features?: string[];
}

// ============================================================================
// CURATED ZIMBABWE DATABASE (Removed - using real Foursquare data only)
// ============================================================================

const CURATED_PLACES: Place[] = [];
    category: "restaurant",
    location: {
      city: "Harare",
      region: "Harare",
      address: "Avondale",
      coordinates: { lat: -17.7942, lng: 31.0551 },
    },
    description: "Contemporary restaurant and bar offering fusion cuisine with Zimbabwean influences. Popular for its vibrant atmosphere.",
    verified: true,
    source: "curated",
    rating: 4.6,
    priceRange: "$$$",
    features: ["Fusion Cuisine", "Bar", "Contemporary", "Live Music"],
  },
  {
    id: "zw-restaurant-003",
    name: "Amanzi Restaurant",
    category: "restaurant",
    location: {
      city: "Harare",
      region: "Harare",
      address: "Borrowdale",
    },
    description: "Contemporary Zimbabwean cuisine with traditional flavors and modern presentation.",
    verified: true,
    source: "curated",
    rating: 4.6,
    priceRange: "$$$",
    features: ["Traditional Cuisine", "Modern Twist", "Outdoor Seating"],
  },
  {
    id: "zw-restaurant-004",
    name: "Victoria 22",
    category: "restaurant",
    location: {
      city: "Victoria Falls",
      region: "Victoria Falls",
      address: "Victoria Falls Town",
    },
    description: "Fine dining with views. Traditional Zimbabwean dishes and international cuisine.",
    verified: true,
    source: "curated",
    rating: 4.7,
    priceRange: "$$$",
    features: ["Fine Dining", "Traditional Menu", "Bar"],
  },

  // Markets
  {
    id: "zw-market-001",
    name: "Mbare Musika",
    category: "market",
    location: {
      city: "Harare",
      region: "Harare",
      address: "Mbare, Harare",
    },
    description: "Zimbabwe's largest produce market. Fresh fruits, vegetables, and local food products.",
    verified: true,
    source: "curated",
    rating: 4.3,
    priceRange: "$",
    features: ["Fresh Produce", "Local Food", "Traditional Market"],
  },
  {
    id: "zw-market-002",
    name: "Renkini Bus Terminus Market",
    category: "market",
    location: {
      city: "Bulawayo",
      region: "Bulawayo",
      address: "Renkini, Bulawayo",
    },
    description: "Bustling local market with fresh produce, traditional foods, and crafts.",
    verified: true,
    source: "curated",
    rating: 4.2,
    priceRange: "$",
    features: ["Fresh Produce", "Crafts", "Street Food"],
  },

  // Cultural Centers
  {
    id: "zw-culture-001",
    name: "National Gallery of Zimbabwe",
    category: "cultural_center",
    location: {
      city: "Harare",
      region: "Harare",
      address: "Julius Nyerere Way, Harare",
    },
    description: "Premier art gallery showcasing Zimbabwean and African contemporary art.",
    culture: ["Zimbabwean Art", "Shona Sculpture"],
    verified: true,
    source: "curated",
    rating: 4.5,
    priceRange: "$",
    features: ["Art Gallery", "Sculpture Garden", "Workshops"],
  },

  // Accommodation
  {
    id: "zw-lodge-001",
    name: "Victoria Falls Safari Lodge",
    category: "accommodation",
    location: {
      city: "Victoria Falls",
      region: "Victoria Falls",
      address: "Squire Cummings Road",
    },
    description: "Award-winning lodge overlooking waterhole with wildlife viewing.",
    verified: true,
    source: "curated",
    rating: 4.8,
    priceRange: "$$$$",
    features: ["Safari Lodge", "Wildlife Viewing", "Restaurant", "Pool"],
  },
];

// ============================================================================
// WIKIDATA HERITAGE SITES (Removed - using real Foursquare data only)
// ============================================================================

const WIKIDATA_HERITAGE: Partial<Place>[] = [];

// ============================================================================
// SEARCH & AGGREGATION LOGIC
// ============================================================================

export interface SearchOptions {
  query?: string;
  category?: PlaceCategory;
  region?: ZimbabweRegion;
  heritage?: boolean;
  verified?: boolean;
  limit?: number;
}

/**
 * Search places across all data sources
 */
export async function searchPlaces(options: SearchOptions): Promise<Place[]> {
  const results: Place[] = [];

  // Search Foursquare (real-time data - primary source)
  if (options.region) {
    try {
      const foursquareResults = await searchFoursquare(options);
      results.push(...foursquareResults);
    } catch (error) {
      console.error("Foursquare search failed:", error);
    }
  }

  // Deduplicate and sort by relevance
  const unique = deduplicatePlaces(results);
  const sorted = sortByRelevance(unique, options);

  return sorted.slice(0, options.limit ?? 50);
}

/**
 * Search curated local database
 */
function searchCurated(options: SearchOptions): Place[] {
  let results = [...CURATED_PLACES];

  if (options.category) {
    results = results.filter((p) => p.category === options.category);
  }

  if (options.region) {
    results = results.filter((p) => p.location.region === options.region);
  }

  if (options.heritage !== undefined) {
    results = results.filter((p) => p.heritage === options.heritage);
  }

  if (options.verified !== undefined) {
    results = results.filter((p) => p.verified === options.verified);
  }

  if (options.query) {
    const q = options.query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.features?.some((f) => f.toLowerCase().includes(q))
    );
  }

  return results;
}

/**
 * Search Foursquare and convert to our format
 */
async function searchFoursquare(options: SearchOptions): Promise<Place[]> {
  const query = options.query ?? getCategoryQuery(options.category);
  const near = `${options.region}, Zimbabwe`;

  const fsqPlaces = await searchZimbabwePlaces({ near, query, limit: 50 });

  return fsqPlaces.map((fsq) => foursquareToPlace(fsq));
}

/**
 * Search Wikidata heritage (from local cache)
 */
function searchWikidata(options: SearchOptions): Place[] {
  let results = [...WIKIDATA_HERITAGE] as Place[];

  if (options.region) {
    results = results.filter((p) => p.location.region === options.region);
  }

  if (options.query) {
    const q = options.query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }

  // Fill in defaults
  return results.map((p) => ({
    ...p,
    id: p.id ?? `wikidata-${p.name.toLowerCase().replace(/\s+/g, "-")}`,
    verified: true,
    source: "wikidata" as const,
  })) as Place[];
}

/**
 * Convert Foursquare place to our format
 */
function foursquareToPlace(fsq: FoursquarePlace): Place {
  const category = fsq.categories?.[0]?.name || "attraction";
  const photos = fsq.photos?.map(p => `${p.prefix}400x400${p.suffix}`) ?? [];
  
  return {
    id: `fsq-${fsq.fsq_place_id}`, // Updated field name
    name: fsq.name,
    category: categorizeFoursquare(category),
    location: {
      city: fsq.location.locality || "Unknown",
      region: (fsq.location.locality || "Harare") as ZimbabweRegion,
      address: fsq.location.formatted_address,
      coordinates: fsq.latitude && fsq.longitude
        ? { lat: fsq.latitude, lng: fsq.longitude } // Updated to use direct lat/lng
        : undefined,
    },
    photos: photos.length > 0 ? photos : undefined,
    verified: false,
    source: "foursquare",
  };
}

/**
 * Categorize Foursquare venue
 */
function categorizeFoursquare(fsqCategory: string): PlaceCategory {
  const lower = fsqCategory.toLowerCase();
  if (lower.includes("restaurant") || lower.includes("dining")) return "restaurant";
  if (lower.includes("cafe") || lower.includes("coffee")) return "cafe";
  if (lower.includes("market")) return "market";
  if (lower.includes("hotel") || lower.includes("lodge")) return "accommodation";
  if (lower.includes("museum") || lower.includes("heritage")) return "heritage_site";
  return "attraction";
}

/**
 * Get search query for category
 */
function getCategoryQuery(category?: PlaceCategory): string {
  switch (category) {
    case "restaurant":
      return "restaurant";
    case "cafe":
      return "cafe";
    case "market":
      return "market";
    case "accommodation":
      return "hotel";
    case "heritage_site":
      return "museum heritage";
    default:
      return "restaurant cafe";
  }
}

/**
 * Remove duplicate places (by name + location)
 */
function deduplicatePlaces(places: Place[]): Place[] {
  const seen = new Set<string>();
  return places.filter((place) => {
    const key = `${place.name.toLowerCase()}-${place.location.city.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Sort places by relevance
 */
function sortByRelevance(places: Place[], options: SearchOptions): Place[] {
  return places.sort((a, b) => {
    // Curated places first
    if (a.source === "curated" && b.source !== "curated") return -1;
    if (b.source === "curated" && a.source !== "curated") return 1;

    // Verified places next
    if (a.verified && !b.verified) return -1;
    if (b.verified && !a.verified) return 1;

    // Heritage sites if heritage filter
    if (options.heritage) {
      if (a.heritage && !b.heritage) return -1;
      if (b.heritage && !a.heritage) return 1;
    }

    // Rating
    const ratingA = a.rating ?? 0;
    const ratingB = b.rating ?? 0;
    return ratingB - ratingA;
  });
}

/**
 * Get place by ID (across all sources)
 */
export async function getPlaceById(id: string): Promise<Place | null> {
  // Check curated first
  const curated = CURATED_PLACES.find((p) => p.id === id);
  if (curated) return curated;

  // Check Wikidata
  const wikidata = WIKIDATA_HERITAGE.find((p) => 
    `wikidata-${p.name?.toLowerCase().replace(/\s+/g, "-")}` === id
  );
  if (wikidata) return wikidata as Place;

  // Foursquare places would be fetched on-demand
  // For now return null
  return null;
}

/**
 * Get heritage sites only
 */
export async function getHeritageSites(region?: ZimbabweRegion): Promise<Place[]> {
  return searchPlaces({ heritage: true, region, limit: 50 });
}

/**
 * Get restaurants in a region
 */
export async function getRestaurants(region: ZimbabweRegion): Promise<Place[]> {
  return searchPlaces({ category: "restaurant", region, limit: 20 });
}

/**
 * Get markets in a region
 */
export async function getMarkets(region: ZimbabweRegion): Promise<Place[]> {
  return searchPlaces({ category: "market", region, limit: 10 });
}
