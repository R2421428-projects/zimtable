import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { discover, generateMenu } from "./ai.server";
import { searchZimbabwePlaces, searchFoodExperiences } from "./foursquare.server";
import { searchPlaces, getHeritageSites, getRestaurants, type SearchOptions } from "./places-engine.server";

const DiscoverInput = z.object({ query: z.string().min(3).max(400) });

const MenuInput = z.object({
  season: z.string().min(2).max(60),
  style: z.string().min(2).max(60),
  audience: z.string().min(2).max(80),
  courses: z.number().int().min(2).max(6),
  targetPrice: z.number().min(2).max(200),
  produce: z
    .array(
      z.object({
        name: z.string().max(80),
        quantity: z.number(),
        unit: z.string().max(20),
        price: z.number(),
        status: z.string().max(20),
        harvest: z.string().max(80),
      }),
    )
    .max(40),
});

export const aiDiscover = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => DiscoverInput.parse(data))
  .handler(async ({ data }) => discover(data.query));

export const aiGenerateMenu = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => MenuInput.parse(data))
  .handler(async ({ data }) => generateMenu(data));

const FoursquareSearchInput = z.object({
  city: z.string().min(2).max(100).optional(),
  query: z.string().min(2).max(200).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

export const foursquareSearch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => FoursquareSearchInput.parse(data))
  .handler(async ({ data }) => 
    searchZimbabwePlaces({ 
      near: data.city ? `${data.city}, Zimbabwe` : "Harare, Zimbabwe",
      query: data.query,
      limit: data.limit ?? 20 
    })
  );

const FoursquareCityInput = z.object({
  city: z.string().min(2).max(100),
});

export const foursquareFoodExperiences = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => FoursquareCityInput.parse(data))
  .handler(async ({ data }) => searchFoodExperiences(data.city));

const PlacesSearchInput = z.object({
  query: z.string().min(2).max(200).optional(),
  category: z.enum(["restaurant", "cafe", "market", "heritage_site", "accommodation", "cultural_center", "farm", "attraction", "activity"]).optional(),
  region: z.enum(["Harare", "Bulawayo", "Victoria Falls", "Mutare", "Gweru", "Masvingo", "Chinhoyi", "Kariba", "Hwange", "Nyanga"]).optional(),
  heritage: z.boolean().optional(),
  verified: z.boolean().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

export const placesSearch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => PlacesSearchInput.parse(data))
  .handler(async ({ data }) => searchPlaces(data as SearchOptions));

export const getHeritageFunction = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => FoursquareCityInput.optional().parse(data))
  .handler(async ({ data }) => getHeritageSites(data?.city as any));

export const getRestaurantsFunction = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => FoursquareCityInput.parse(data))
  .handler(async ({ data }) => getRestaurants(data.city as any));
