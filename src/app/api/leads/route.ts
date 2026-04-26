import { type NextRequest } from "next/server";
import { timingSafeEqual, createHash } from "crypto";
import { getLeads } from "@/lib/leads";

function isValidKey(provided: string, expected: string): boolean {
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(provided), hash(expected));
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const key = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const expected = process.env.LEADS_API_KEY;

  if (!key || !expected || !isValidKey(key, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = Math.max(
    1,
    Math.min(parseInt(limitParam ?? "50", 10) || 50, 200)
  );

  try {
    const leads = await getLeads(limit);
    return Response.json({ leads, count: leads.length });
  } catch (err) {
    console.error(
      "leads fetch error",
      err instanceof Error ? err.message : err
    );
    return Response.json(
      { error: "Failed to retrieve leads" },
      { status: 500 }
    );
  }
}
