import { ipAddress } from "@vercel/functions";
import { CAT_COUNT, isCat, type Cat } from "@/lib/cats";
import { catApiGlobalRatelimit, catApiRatelimit } from "@/lib/ratelimit";

const LOAD_ERROR = "We couldn't load the cats right now. Please try again.";
const TEMPORARY_ERROR = "Cat Royale is temporarily unavailable. Please try again later.";

export async function GET(request: Request) {
  const identifier = ipAddress(request) ?? "local-development";

  try {
    const rateLimit = await catApiRatelimit.limit(identifier);

    if (rateLimit.reason === "timeout") {
      return Response.json({ error: TEMPORARY_ERROR }, { status: 503 });
    }

    if (!rateLimit.success) {
      const retryAfter = Math.max(1, Math.ceil((rateLimit.reset - Date.now()) / 1000));

      return Response.json(
        { error: "You're starting Royales too quickly. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }
  } catch (error) {
    console.error("Per-IP rate limit check failed:", error);
    return Response.json({ error: TEMPORARY_ERROR }, { status: 503 });
  }

  const apiKey = process.env.CAT_API_KEY;

  if (!apiKey) {
    console.error("CAT_API_KEY is missing from the server environment.");
    return Response.json({ error: LOAD_ERROR }, { status: 500 });
  }

  try {
    const uniqueCats = new Map<string, Cat>();

    for (let attempt = 0; attempt < 3 && uniqueCats.size < CAT_COUNT; attempt++) {
      try {
        const globalRateLimit = await catApiGlobalRatelimit.limit("global");

        if (globalRateLimit.reason === "timeout") {
          return Response.json({ error: TEMPORARY_ERROR }, { status: 503 });
        }

        if (!globalRateLimit.success) {
          const retryAfter = Math.max(1, Math.ceil((globalRateLimit.reset - Date.now()) / 1000));

          return Response.json(
            { error: "Cat Royale has reached its temporary usage limit. Please try again later." },
            { status: 503, headers: { "Retry-After": String(retryAfter) } }
          );
        }
      } catch (error) {
        console.error("Global rate limit check failed:", error);
        return Response.json({ error: TEMPORARY_ERROR }, { status: 503 });
      }

      const url = new URL("https://api.thecatapi.com/v1/images/search");

      url.searchParams.set("limit", String(CAT_COUNT));
      url.searchParams.set("mime_types", "jpg,png");

      const response = await fetch(url, {
        headers: { "x-api-key": apiKey },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        console.error(`The Cat API returned HTTP ${response.status}.`);
        return Response.json({ error: LOAD_ERROR }, { status: 502 });
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        console.error("The Cat API returned an unexpected response format.");
        return Response.json({ error: LOAD_ERROR }, { status: 502 });
      }

      for (const item of data) {
        if (isCat(item)) {
          uniqueCats.set(item.id, { id: item.id, url: item.url });
        }
      }
    }

    if (uniqueCats.size < CAT_COUNT) {
      console.error(`Only ${uniqueCats.size} unique valid cats were retrieved.`);
      return Response.json({ error: "We couldn't load enough cats. Please try again." }, { status: 503 });
    }

    const cats = [...uniqueCats.values()].slice(0, CAT_COUNT);

    for (let index = cats.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [cats[index], cats[randomIndex]] = [cats[randomIndex], cats[index]];
    }

    return Response.json(cats, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to retrieve cats:", error);
    return Response.json({ error: LOAD_ERROR }, { status: 502 });
  }
}