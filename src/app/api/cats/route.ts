import { ipAddress } from "@vercel/functions";
import { CAT_COUNT, isCat, type Cat } from "@/lib/cats";
import { catApiRatelimit } from "@/lib/ratelimit";

export async function GET(request: Request) {
  const identifier = ipAddress(request) ?? "local-development";
  const rateLimit = await catApiRatelimit.limit(identifier);

  if (!rateLimit.success) {
    const retryAfter = Math.max(1, Math.ceil((rateLimit.reset - Date.now()) / 1000));

    return Response.json(
      { error: "You're starting Royales too quickly. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const apiKey = process.env.CAT_API_KEY;

  if (!apiKey) {
    console.error("CAT_API_KEY is missing from the server environment.");
    return Response.json({ error: "We couldn't load the cats right now. Please try again." }, { status: 500 });
  }

  try {
    const uniqueCats = new Map<string, Cat>();
    const signal = AbortSignal.timeout(15000);

    // Request more batches until we have enough cats, with a maximum of 3 attempts.
    for (let attempt = 0; attempt < 3 && uniqueCats.size < CAT_COUNT; attempt++) {
      const url = new URL("https://api.thecatapi.com/v1/images/search");

      url.searchParams.set("limit", String(CAT_COUNT));
      url.searchParams.set("mime_types", "jpg,png");

      const response = await fetch(url, { headers: { "x-api-key": apiKey }, cache: "no-store", signal });

      if (!response.ok) {
        console.error(`The Cat API returned HTTP ${response.status}.`);
        return Response.json({ error: "We couldn't load the cats right now. Please try again." }, { status: 502 });
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        console.error("The Cat API returned an unexpected response format.");
        return Response.json({ error: "We couldn't load the cats right now. Please try again." }, { status: 502 });
      }

      for (const item of data) {
        if (isCat(item)) {
          uniqueCats.set(item.id, { id: item.id, url: item.url });
        }
      }
    }

    // The retry loop has finished. Check whether we collected enough cats.
    if (uniqueCats.size < CAT_COUNT) {
      console.error(`Only ${uniqueCats.size} unique valid cats were retrieved.`);
      return Response.json({ error: "We couldn't load enough cats. Please try again." }, { status: 503 });
    }

    const cats = [...uniqueCats.values()].slice(0, CAT_COUNT);

    // Shuffle the cats before sending them to the browser.
    for (let index = cats.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [cats[index], cats[randomIndex]] = [cats[randomIndex], cats[index]];
    }

    return Response.json(cats, { headers: { "Cache-Control": "no-store" } });

  } catch (error) {
    console.error("Failed to retrieve cats:", error);
    return Response.json({ error: "We couldn't load the cats right now. Please try again." }, { status: 502 });
  }
}