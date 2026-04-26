import { Redis } from "@upstash/redis";
import { Resend } from "resend";

export interface Lead {
  name?: string;
  email?: string;
  phone?: string;
  reason: string;
  capturedAt: string;
}

let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

export async function saveLead(lead: Lead): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    console.warn("Lead not saved — Upstash not configured");
    return;
  }

  await redis.lpush("shoreline-leads", JSON.stringify(lead));

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (apiKey && to) {
    const resend = new Resend(apiKey);
    resend.emails
      .send({
        from:
          process.env.RESEND_FROM_EMAIL ??
          "Shoreline Chat <onboarding@resend.dev>",
        to,
        subject: `New Chat Lead: ${(lead.name || "Website Visitor").replace(/[\r\n]/g, "").slice(0, 100)}`,
        text: [
          "A patient submitted their contact info via the website chat.\n",
          lead.name ? `Name: ${lead.name}` : null,
          lead.email ? `Email: ${lead.email}` : null,
          lead.phone ? `Phone: ${lead.phone}` : null,
          `Reason: ${lead.reason}`,
          `\nCaptured: ${lead.capturedAt}`,
        ]
          .filter(Boolean)
          .join("\n"),
      })
      .catch((err) =>
        console.error(
          "lead email error",
          err instanceof Error ? err.message : err
        )
      );
  }
}

export async function getLeads(limit = 50): Promise<Lead[]> {
  const redis = getRedis();
  if (!redis) return [];

  const raw = await redis.lrange("shoreline-leads", 0, limit - 1);
  return raw.flatMap((item) => {
    try {
      const parsed = typeof item === "string" ? JSON.parse(item) : item;
      if (parsed && typeof parsed === "object" && "reason" in parsed) {
        return [parsed as Lead];
      }
      return [];
    } catch {
      return [];
    }
  });
}
