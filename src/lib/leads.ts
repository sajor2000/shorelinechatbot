import { Redis } from "@upstash/redis";
import { Resend } from "resend";

export interface Lead {
  name?: string;
  email?: string;
  phone?: string;
  reason: string;
  capturedAt: string;
}

const REDIS_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

let _resend: Resend | null = null;
function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!_resend) _resend = new Resend(apiKey);
  return _resend;
}

function isLead(value: unknown): value is Lead {
  return (
    typeof value === "object" &&
    value !== null &&
    "reason" in value &&
    typeof (value as Record<string, unknown>).reason === "string"
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildLeadEmailHtml(lead: Lead): string {
  const name = escapeHtml(lead.name || "Website Visitor");
  const rows: string[] = [];

  if (lead.name) {
    rows.push(`
      <tr>
        <td style="padding:12px 16px;color:#6b7280;font-size:13px;width:90px;vertical-align:top;">Name</td>
        <td style="padding:12px 16px;color:#111827;font-size:15px;font-weight:600;">${escapeHtml(lead.name)}</td>
      </tr>`);
  }
  if (lead.phone) {
    rows.push(`
      <tr>
        <td style="padding:12px 16px;color:#6b7280;font-size:13px;vertical-align:top;">Phone</td>
        <td style="padding:12px 16px;">
          <a href="tel:${escapeHtml(lead.phone.replace(/\D/g, ""))}" style="color:#0d9488;font-size:15px;font-weight:600;text-decoration:none;">${escapeHtml(lead.phone)}</a>
        </td>
      </tr>`);
  }
  if (lead.email) {
    rows.push(`
      <tr>
        <td style="padding:12px 16px;color:#6b7280;font-size:13px;vertical-align:top;">Email</td>
        <td style="padding:12px 16px;">
          <a href="mailto:${escapeHtml(lead.email)}" style="color:#0d9488;font-size:15px;font-weight:600;text-decoration:none;">${escapeHtml(lead.email)}</a>
        </td>
      </tr>`);
  }
  rows.push(`
    <tr>
      <td style="padding:12px 16px;color:#6b7280;font-size:13px;vertical-align:top;">Reason</td>
      <td style="padding:12px 16px;color:#111827;font-size:14px;line-height:1.5;">${escapeHtml(lead.reason)}</td>
    </tr>`);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background-color:#0d9488;padding:24px 28px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.2px;">Shoreline Dental Chicago</p>
            <p style="margin:4px 0 0;font-size:13px;color:#ccfbf1;">New patient inquiry from website chat</p>
          </td>
        </tr>

        <!-- Patient name banner -->
        <tr>
          <td style="padding:24px 28px 8px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.3px;">${name}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">${escapeHtml(lead.capturedAt)}</p>
          </td>
        </tr>

        <!-- Contact details -->
        <tr>
          <td style="padding:12px 28px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
              ${rows.join('<tr><td colspan="2" style="border-top:1px solid #f3f4f6;"></td></tr>')}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td align="center" style="padding:4px 28px 28px;">
            ${lead.phone ? `<a href="tel:${escapeHtml(lead.phone.replace(/\D/g, ""))}" style="display:inline-block;background-color:#0d9488;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">Call ${escapeHtml(lead.name || "Patient")}</a>` : ""}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#f9fafb;padding:16px 28px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">This is an automated notification from your website chat assistant. Replies to this email are not monitored.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function saveLead(lead: Lead): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    console.warn("Lead not saved — Upstash not configured");
    return;
  }

  try {
    await withTimeout(
      redis.lpush("shoreline-leads", JSON.stringify(lead)),
      REDIS_TIMEOUT_MS
    );
  } catch (err) {
    console.error("redis lpush error", err instanceof Error ? err.message : err);
  }

  const resend = getResend();
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (resend && to) {
    const safeName = (lead.name || "Website Visitor")
      .replace(/[\r\n]/g, "")
      .slice(0, 100);
    try {
      await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL ??
          "Lab Sync <notifications@labsync.space>",
        to,
        subject: `New patient inquiry from ${safeName}`,
        html: buildLeadEmailHtml(lead),
        text: [
          `New patient inquiry from website chat\n`,
          lead.name ? `Name: ${lead.name}` : null,
          lead.phone ? `Phone: ${lead.phone}` : null,
          lead.email ? `Email: ${lead.email}` : null,
          `Reason: ${lead.reason}`,
          `\nCaptured: ${lead.capturedAt}`,
          `\n---\nShoreline Dental Chicago — Automated notification`,
        ]
          .filter(Boolean)
          .join("\n"),
      });
    } catch (err) {
      console.error("lead email error", err instanceof Error ? err.message : err);
    }
  }
}

export async function getLeads(limit = 50): Promise<Lead[]> {
  const redis = getRedis();
  if (!redis) return [];

  const raw = await withTimeout(
    redis.lrange("shoreline-leads", 0, limit - 1),
    REDIS_TIMEOUT_MS
  );
  return raw.flatMap((item) => {
    try {
      const parsed = typeof item === "string" ? JSON.parse(item) : item;
      if (isLead(parsed)) return [parsed];
      return [];
    } catch {
      return [];
    }
  });
}
