import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const catApiRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "cat-royale:cats",
  timeout: 1000,
});
