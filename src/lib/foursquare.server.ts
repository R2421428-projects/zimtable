/**
 * Foursquare Places API integration for real Zimbabwe locations
 * Updated to use new Places API (2024)
 */

const FOURSQUARE_API_KEY = "0TGVOIKRWYNK0KDZYD3VA2IWD4TG0PAU23HP5QJPGMD25FCY";
const FOURSQUARE_ENDPOINT = "https://places-api.foursquare.com/places/search";
const PLACES_API_VERSION = "2025-06-17";

export type FoursquarePlace = {
  fsq_id: string;
  name: string;
  location: {
    formatted_address?: string;
    locality?: string;
    region?: string;
    country?: string;
  };
  categories: Array<{
    id: number;
    name: string;
    icon: {
      prefix: string;
      suffix: string;
    };
  }>;
  distance?: number;
  geocodes?: {
    main: {
      latitude: number;
      longitude: number;
    };
  };
  photos?: Array<{
    id: string;
    created_at: string;
    prefix: string;
    suffix: string;
    width: number;
    height: number;
  }>;
};

type FoursquareResponse = {
  results: FoursquarePlace[];
};

/**
 * Search for restaurants and food experiences in Zimbabwe
 * Using Foursquare v3 Places API
 */
export async function searchZimbabwePlaces(params: {
  near?: string; // city name like "Harare, Zimbabwe" or "Bulawayo, Zimbabwe"
  query?: string; // search term like "restaurant" or "traditional food"
  categories?: string; // comma-separated category IDs
  limit?: number;
}): Promise<FoursquarePlace[]> {
  const searchParams = new URLSearchParams({
    near: params.near ?? "Harare, Zimbabwe",
    limit: String(params.limit ?? 20),
    fields: "fsq_id,name,location,categories,distance,geocodes,photos",
  });

  if (params.query) {
    searchParams.set("query", params.query);
  }

  // Foursquare v3 category IDs for food & dining
  if (params.categories) {
    searchParams.set("categories", params.categories);
  }

  try {
    const res = await fetch(`${FOURSQUARE_ENDPOINT}?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${FOURSQUARE_API_KEY}`,
        "X-Places-Api-Version": PLACES_API_VERSION,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Foursquare API error ${res.status}:`, errorText);
      return [];
    }

    const data = (await res.json()) as FoursquareResponse;
    console.log(`Foursquare returned ${data.results?.length ?? 0} results`);
    return data.results ?? [];
  } catch (error) {
    console.error("Foursquare fetch error:", error);
    return [];
  }
}

/**
 * Get details for a specific place by ID
 */
export async function getPlaceDetails(fsqId: string): Promise<FoursquarePlace | null> {
  try {
    const res = await fetch(`https://places-api.foursquare.com/places/${fsqId}`, {
      headers: {
        Authorization: `Bearer ${FOURSQUARE_API_KEY}`,
        Accept: "application/json",
        "X-Places-Api-Version": PLACES_API_VERSION,
      },
    });

    if (!res.ok) {
      console.error(`Foursquare place details error: ${res.status}`);
      return null;
    }

    return (await res.json()) as FoursquarePlace;
  } catch (error) {
    console.error("Foursquare place fetch error:", error);
    return null;
  }
}

/**
 * Search for specific types of food experiences
 */
export async function searchFoodExperiences(city: string = "Harare"): Promise<{
  restaurants: FoursquarePlace[];
  markets: FoursquarePlace[];
  cafes: FoursquarePlace[];
}> {
  const [restaurants, markets, cafes] = await Promise.all([
    searchZimbabwePlaces({ near: `${city}, Zimbabwe`, query: "restaurant", limit: 15 }),
    searchZimbabwePlaces({ near: `${city}, Zimbabwe`, query: "market", limit: 10 }),
    searchZimbabwePlaces({ near: `${city}, Zimbabwe`, query: "cafe", limit: 10 }),
  ]);

  return { restaurants, markets, cafes };
}

/**
 * Get photo URL from Foursquare photo object
 * Size options: 'original', 'small' (200x200), 'medium' (400x400), 'large' (800x800)
 */
export function getFoursquarePhotoUrl(
  photo: FoursquarePlace["photos"][0],
  size: "small" | "medium" | "large" | "original" = "medium",
): string {
  if (!photo) return "";

  const sizeMap = {
    small: "200x200",
    medium: "400x400",
    large: "800x800",
    original: "original",
  };

  return `${photo.prefix}${sizeMap[size]}${photo.suffix}`;
}
