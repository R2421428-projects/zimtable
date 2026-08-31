import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { discover, generateMenu } from "./ai.server";

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
