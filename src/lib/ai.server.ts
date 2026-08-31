/**
 * AI service layer. Grounded prompts for tourism discovery and seasonal menu
 * generation, with deterministic fallbacks so a demo never breaks on a
 * gateway/network failure.
 */
import { EXPERIENCES, money, type Experience } from "./domain";

const MODEL = "google/gemini-3.7-flash";
const OPENROUTER_MODEL = "google/gemini-2.5-flash";
const ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";


export type DiscoveryMatch = {
  experienceId: string;
  headline: string;
  reasons: string[];
};

export type DiscoveryResult = {
  intro: string;
  matches: DiscoveryMatch[];
  source: "ai" | "fallback";
};

export type MenuCourse = {
  course: string;
  dish: string;
  description: string;
  produceUsed: string[];
  price: number;
  culture: string;
};

export type MenuResult = {
  title: string;
  note: string;
  courses: MenuCourse[];
  source: "ai" | "fallback";
};

type ProduceContext = { name: string; quantity: number; unit: string; price: number; status: string; harvest: string };

const GEMINI_MODELS = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash"];
const geminiUrl = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

/** Gemini's responseSchema is a subset of JSON Schema — drop unsupported keys. */
function toGeminiSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(toGeminiSchema);
  if (schema && typeof schema === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(schema as Record<string, unknown>)) {
      if (k === "additionalProperties" || k === "strict") continue;
      out[k] = toGeminiSchema(v);
    }
    return out;
  }
  return schema;
}

async function geminiChat(system: string, user: string, schema: Record<string, unknown>, key: string) {
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: toGeminiSchema(schema),
    },
  });

  let lastError = new Error("gemini unavailable");
  // Models are tried in order; 429/503 mean transient overload, so fall through.
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(geminiUrl(model), {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-goog-api-key": key },
        body,
      });
      if (!res.ok) throw new Error(`gemini ${model} ${res.status}`);
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      if (!text.trim()) throw new Error("empty gemini response");
      return JSON.parse(text) as unknown;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError;
}


async function chat(system: string, user: string, schema: Record<string, unknown>) {
  const geminiKey = process.env["GEMINI_API_KEY"];
  const openrouterKey = process.env["OPENROUTER_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];

  if (geminiKey) {
    try {
      return await geminiChat(system, user, schema, geminiKey);
    } catch (err) {
      if (!openrouterKey && !lovableKey) throw err;
    }
  }
  if (!openrouterKey && !lovableKey) throw new Error("missing key");

  const useOpenRouter = Boolean(openrouterKey);
  const res = await fetch(useOpenRouter ? OPENROUTER_ENDPOINT : ENDPOINT, {
    method: "POST",
    headers: useOpenRouter
      ? { "Content-Type": "application/json", Authorization: `Bearer ${openrouterKey}` }
      : { "Content-Type": "application/json", "Lovable-API-Key": lovableKey!, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: useOpenRouter ? OPENROUTER_MODEL : MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_schema", json_schema: { name: "result", strict: true, schema } },
    }),
  });
  if (!res.ok) throw new Error(`gateway ${res.status}`);

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("empty response");
  return JSON.parse(content) as unknown;
}


function parseBudget(query: string): number | null {
  const m = query.match(/\$?\s?(\d{1,4})/);
  return m?.[1] ? Number(m[1]) : null;
}

function scoreLocal(query: string): Experience[] {
  const q = query.toLowerCase();
  const budget = parseBudget(q);
  const words = q.split(/[^a-z]+/).filter((w) => w.length > 3);
  return [...EXPERIENCES]
    .map((e) => {
      let score = e.rating;
      if (budget && e.price <= budget) score += 3;
      if (budget && e.price > budget) score -= 4;
      const haystack = `${e.name} ${e.city} ${e.tagline} ${e.categories.join(" ")} ${e.keyDish}`.toLowerCase();
      score += words.filter((w) => haystack.includes(w)).length * 1.5;
      return { e, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((r) => r.e);
}

export async function discover(query: string): Promise<DiscoveryResult> {
  const ranked = scoreLocal(query);
  const catalogue = EXPERIENCES.map(
    (e) =>
      `${e.id} | ${e.name} | ${e.city} | ${money(e.price)} | ${e.rating}★ | ${e.categories.join(", ")} | key dish: ${e.keyDish}`,
  ).join("\n");

  try {
    const raw = await chat(
      "You are the discovery assistant for The Zimbabwean Table, a Zimbabwe culinary tourism platform. Recommend ONLY from the supplied catalogue, using the exact experience ids. Respect stated budgets and cities. Give short, concrete reasons (max 6 words each) such as 'Within your $30 budget'. Be culturally respectful and never invent experiences.",
      `Traveller request: "${query}"\n\nCatalogue:\n${catalogue}\n\nReturn 1-3 matches, best first.`,
      {
        type: "object",
        additionalProperties: false,
        required: ["intro", "matches"],
        properties: {
          intro: { type: "string" },
          matches: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["experienceId", "headline", "reasons"],
              properties: {
                experienceId: { type: "string" },
                headline: { type: "string" },
                reasons: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
    );
    const parsed = raw as { intro: string; matches: DiscoveryMatch[] };
    const matches = (parsed.matches ?? []).filter((m) => EXPERIENCES.some((e) => e.id === m.experienceId)).slice(0, 3);
    if (!matches.length) throw new Error("no valid matches");
    return { intro: parsed.intro, matches, source: "ai" };
  } catch {
    const budget = parseBudget(query);
    return {
      intro: "Here is what matches your request from our partner tables.",
      source: "fallback",
      matches: ranked.slice(0, 2).map((e) => ({
        experienceId: e.id,
        headline: e.name,
        reasons: [
          budget && e.price <= budget ? `Within your $${budget} budget` : `${money(e.price)} per guest`,
          `${e.categories.includes("heritage") ? "Heritage" : "Authentic local"} cuisine`,
          `${e.city} — ${e.authenticity.toLowerCase()}`,
          `${Math.round(e.durationMins / 60)}h cultural experience`,
        ],
      })),
    };
  }
}

export async function generateMenu(input: {
  produce: ProduceContext[];
  season: string;
  style: string;
  courses: number;
  targetPrice: number;
  audience: string;
}): Promise<MenuResult> {
  const usable = input.produce.filter((p) => p.status !== "out" && p.quantity > 0);
  const list = usable.map((p) => `${p.name} — ${p.quantity}${p.unit} @ $${p.price}/${p.unit} (${p.harvest})`).join("\n");

  try {
    const raw = await chat(
      "You are a Zimbabwean chef designing seasonal restaurant menus for The Zimbabwean Table. You may ONLY use ingredients from the supplied available-produce list plus basic pantry staples (salt, oil, water, maize meal if listed). Never use produce that is not listed. Keep dishes authentically Zimbabwean, respectful and specific.",
      `Season: ${input.season}\nRestaurant style: ${input.style}\nGuests: ${input.audience}\nTarget price per course: about $${input.targetPrice}\nNumber of courses: ${input.courses}\n\nAvailable produce:\n${list}\n\nDesign the menu. produceUsed must list exact produce names from the list.`,
      {
        type: "object",
        additionalProperties: false,
        required: ["title", "note", "courses"],
        properties: {
          title: { type: "string" },
          note: { type: "string" },
          courses: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["course", "dish", "description", "produceUsed", "price", "culture"],
              properties: {
                course: { type: "string" },
                dish: { type: "string" },
                description: { type: "string" },
                produceUsed: { type: "array", items: { type: "string" } },
                price: { type: "number" },
                culture: { type: "string" },
              },
            },
          },
        },
      },
    );
    const parsed = raw as MenuResult;
    const names = usable.map((p) => p.name.toLowerCase());
    const courses = (parsed.courses ?? [])
      .map((c) => ({ ...c, produceUsed: (c.produceUsed ?? []).filter((n) => names.includes(n.toLowerCase())) }))
      .filter((c) => c.produceUsed.length > 0)
      .slice(0, input.courses);
    if (!courses.length) throw new Error("ungrounded menu");
    return { title: parsed.title, note: parsed.note, courses, source: "ai" };
  } catch {
    return fallbackMenu(usable, input);
  }
}

function fallbackMenu(
  usable: ProduceContext[],
  input: { season: string; style: string; courses: number; targetPrice: number },
): MenuResult {
  const has = (n: string) => usable.find((p) => p.name.toLowerCase().includes(n));
  const templates: MenuCourse[] = [];
  const butternut = has("butternut");
  const greens = has("greens");
  const mushroom = has("mushroom");
  const fish = has("fish");
  const maize = has("maize");
  const mopane = has("mopane");
  const baobab = has("baobab");
  const groundnut = has("groundnut");

  if (butternut)
    templates.push({
      course: "Starter",
      dish: "Roasted butternut with wild herbs",
      description: "Butternut roasted over coals, finished with herbs and a drizzle of honey.",
      produceUsed: [butternut.name],
      price: Math.max(4, Math.round(input.targetPrice * 0.6)),
      culture: "Butternut carries the sweetness of the harvest season on Zimbabwean tables.",
    });
  if (mushroom)
    templates.push({
      course: "Starter",
      dish: "Pan-seared mushrooms with dovi",
      description: "Fresh mushrooms seared and folded through a light groundnut sauce.",
      produceUsed: [mushroom.name, ...(groundnut ? [groundnut.name] : [])],
      price: Math.max(5, Math.round(input.targetPrice * 0.7)),
      culture: "Wild mushrooms appear after the first rains and are gathered by families.",
    });
  if (fish || maize)
    templates.push({
      course: "Main",
      dish: fish ? "Grilled bream with sadza and seasonal greens" : "Green maize and bean stew with sadza",
      description: fish
        ? "Lake-caught bream grilled over wood, served with soft sadza and greens."
        : "Fresh green maize simmered with beans and tomato, served with sadza.",
      produceUsed: [fish?.name ?? maize!.name, ...(greens ? [greens.name] : [])],
      price: Math.max(8, Math.round(input.targetPrice * 1.2)),
      culture: "Sadza with a relish is the centre of the Zimbabwean meal, shared from one table.",
    });
  if (greens)
    templates.push({
      course: "Side",
      dish: "Muriwo une dovi",
      description: "Leafy greens simmered with groundnut butter until glossy.",
      produceUsed: [greens.name, ...(groundnut ? [groundnut.name] : [])],
      price: Math.max(3, Math.round(input.targetPrice * 0.4)),
      culture: "Greens with dovi is a household relish found across the country.",
    });
  if (mopane)
    templates.push({
      course: "Regional plate",
      dish: "Madora with tomato and onion",
      description: "Dried mopane worms rehydrated and fried with tomato and onion.",
      produceUsed: [mopane.name],
      price: Math.max(6, Math.round(input.targetPrice)),
      culture: "Madora are harvested seasonally and prized as a protein-rich delicacy.",
    });
  if (baobab)
    templates.push({
      course: "Dessert",
      dish: "Baobab cream with millet crumb",
      description: "Tart baobab folded through cream, finished with toasted millet.",
      produceUsed: [baobab.name],
      price: Math.max(4, Math.round(input.targetPrice * 0.6)),
      culture: "Baobab fruit, or mawuyu, is a beloved wild-harvested flavour.",
    });

  const courses = templates.slice(0, Math.max(2, input.courses));
  return {
    title: `${input.season} Zimbabwean Menu`,
    note: `Built from ${usable.length} produce lines currently available from partner farmers. Prepared as a ${input.style.toLowerCase()} menu.`,
    courses: courses.length
      ? courses
      : [
          {
            course: "Main",
            dish: "Sadza with seasonal relish",
            description: "A simple plate using what is currently in from the farms.",
            produceUsed: usable.slice(0, 2).map((p) => p.name),
            price: input.targetPrice,
            culture: "Menus follow what the land gives that week.",
          },
        ],
    source: "fallback",
  };
}
