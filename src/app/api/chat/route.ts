import OpenAI from "openai";
import { type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { getPageContext } from "@/lib/page-context";
import { saveLead } from "@/lib/leads";

const ALLOWED_ORIGINS = [
  "https://www.shorelinedentalchicago.com",
  "https://shorelinedentalchicago.com",
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000"] : []),
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : null;
  if (!allowedOrigin) return {};
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
}

const VALID_ROLES = new Set(["user", "assistant"]);
const MAX_CONTENT_LENGTH = 4000;
const UPSTREAM_TIMEOUT_MS = 8000;
const CHAT_MODEL =
  process.env.CHAT_MODEL ?? "google/gemini-3-flash-preview";
const encoder = new TextEncoder();

// Strip non-language characters (Arabic/CJK/symbol artifacts from Gemini).
// Keeps Latin scripts (English, Spanish, Polish), common punctuation, and whitespace.
const GARBAGE_RE = /[^\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}\s]/gu;
function sanitizeText(text: string): string {
  return text.replace(GARBAGE_RE, " ").replace(/ {2,}/g, " ");
}

const openai =
  process.env.OPENROUTER_API_KEY
    ? new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        maxRetries: 0,
        timeout: UPSTREAM_TIMEOUT_MS,
      })
    : null;

const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(20, "60 s"),
        prefix: "shoreline-chat",
      })
    : null;

const TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "capture_lead",
      description:
        "Save a patient's contact information when they want to be contacted, schedule a callback, or need follow-up from the office.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Patient's full name" },
          email: { type: "string", description: "Patient's email address" },
          phone: { type: "string", description: "Patient's phone number" },
          reason: {
            type: "string",
            description: "Brief summary of why the patient wants to be contacted",
          },
        },
        required: ["reason"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "suggest_followups",
      description:
        "Suggest 1-2 short follow-up questions the patient might want to ask next. Call this with every response.",
      parameters: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: { type: "string" },
            description: "1-2 short follow-up questions (max 50 chars each)",
          },
        },
        required: ["suggestions"],
      },
    },
  },
];

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous"
  );
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (ratelimit) {
    try {
      const ip = getClientIp(request);
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return Response.json(
          { error: "Too many requests. Please try again in a minute." },
          { status: 429, headers: corsHeaders }
        );
      }
    } catch (err) {
      console.error("rate-limiter error, failing open", { event: "ratelimit_open", reason: err instanceof Error ? err.message : err });
    }
  } else if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "Server misconfigured" },
      { status: 500, headers: corsHeaders }
    );
  }

  if (!openai) {
    return Response.json(
      { error: "Server misconfigured" },
      { status: 500, headers: corsHeaders }
    );
  }

  let body: { messages: unknown; pageUrl?: unknown };
  try {
    const parsed = await request.json();
    if (!parsed || typeof parsed !== "object") {
      return Response.json(
        { error: "messages array required" },
        { status: 400, headers: corsHeaders }
      );
    }
    body = parsed;
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400, headers: corsHeaders }
    );
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json(
      { error: "messages array required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const messages = body.messages
    .filter(
      (m): m is { role: string; content: string } =>
        typeof m === "object" &&
        m !== null &&
        "role" in m &&
        "content" in m &&
        VALID_ROLES.has((m as { role: string }).role) &&
        typeof (m as { content: unknown }).content === "string"
    )
    .slice(-20)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content.slice(0, MAX_CONTENT_LENGTH),
    }));

  if (messages.length === 0) {
    return Response.json(
      { error: "No valid messages" },
      { status: 400, headers: corsHeaders }
    );
  }

  const pageContext = getPageContext(
    typeof body.pageUrl === "string" ? (body.pageUrl as string).slice(0, 500) : undefined
  );
  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
    weekday: "long",
  });
  const timeInfo = `\n\n## Current Time\nIt is currently ${now} (Chicago time).`;
  const basePrompt = pageContext
    ? `${SYSTEM_PROMPT}\n\n## Current Page Context\n\n${pageContext}\n\n## Page Context Instructions\n\n- Use the context above to understand what the visitor is interested in and tailor your greeting.\n- You may confirm that the practice offers a service mentioned in the context.\n- Do NOT explain treatment processes, list benefits, compare options, or describe clinical signs — even if asked. Redirect clinical questions to the doctors.\n- Steer toward scheduling a consultation or collecting contact information for follow-up.`
    : SYSTEM_PROMPT;
  const systemContent = basePrompt + timeInfo;

  const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemContent },
    ...messages,
  ];

  const abort = new AbortController();
  const abortTimer = setTimeout(() => abort.abort(), UPSTREAM_TIMEOUT_MS * 3);

  let stream;
  try {
    stream = await openai.chat.completions.create(
      {
        model: CHAT_MODEL,
        max_tokens: 512,
        temperature: 0.9,
        stream: true,
        tools: TOOLS,
        messages: chatMessages,
      },
      { signal: abort.signal },
    );
  } catch (err) {
    clearTimeout(abortTimer);
    console.error("upstream error", err instanceof Error ? err.message : err);
    return Response.json(
      { error: "Upstream API unavailable" },
      { status: 502, headers: corsHeaders }
    );
  }

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const pendingToolCalls = new Map<
          number,
          { id: string; name: string; args: string }
        >();
        let assistantContent = "";

        for await (const chunk of stream) {
          if (abort.signal.aborted) throw new Error("Request timeout");
          const delta = chunk.choices[0]?.delta;

          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              if (!pendingToolCalls.has(tc.index)) {
                pendingToolCalls.set(tc.index, { id: "", name: "", args: "" });
              }
              const part = pendingToolCalls.get(tc.index)!;
              if (tc.id) part.id = tc.id;
              if (tc.function?.name) part.name = tc.function.name;
              if (tc.function?.arguments) part.args += tc.function.arguments;
            }
          }

          const raw = delta?.content;
          if (raw) {
            const text = sanitizeText(raw);
            assistantContent += text;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }

        if (pendingToolCalls.size > 0) {
          const allToolCalls = Array.from(pendingToolCalls.values());

          for (const tc of allToolCalls) {
            if (tc.name === "suggest_followups") {
              try {
                const args = JSON.parse(tc.args);
                if (Array.isArray(args.suggestions)) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ suggestions: args.suggestions.slice(0, 2) })}\n\n`)
                  );
                }
              } catch { /* ignore malformed */ }
            }
          }

          const leadCalls = allToolCalls.filter((tc) => tc.name === "capture_lead").slice(0, 1);
          const toolResultMsgs: OpenAI.ChatCompletionToolMessageParam[] = [];

          for (const tc of leadCalls) {
            let toolSuccess = true;
            try {
              const args = JSON.parse(tc.args);
              if (
                typeof args !== "object" ||
                args === null ||
                typeof args.reason !== "string"
              ) {
                throw new Error("Invalid tool call arguments");
              }
              const clamp = (v: unknown, max: number) =>
                typeof v === "string" ? v.slice(0, max) : undefined;
              await saveLead({
                name: clamp(args.name, 200),
                email: clamp(args.email, 320),
                phone: clamp(args.phone, 30),
                reason: args.reason.slice(0, 1000),
                capturedAt: new Date().toLocaleString("en-US", {
                  timeZone: "America/Chicago",
                }),
              });
            } catch (err) {
              console.error(
                "lead save error",
                err instanceof Error ? err.message : err
              );
              toolSuccess = false;
            }
            toolResultMsgs.push({
              role: "tool",
              tool_call_id: tc.id,
              content: JSON.stringify({ success: toolSuccess }),
            });
          }

          if (leadCalls.length > 0) {
            const assistantMsg: OpenAI.ChatCompletionAssistantMessageParam = {
              role: "assistant",
              ...(assistantContent && { content: assistantContent }),
              tool_calls: leadCalls.map((tc) => ({
                id: tc.id,
                type: "function" as const,
                function: { name: tc.name, arguments: tc.args },
              })),
            };

            const followUp = await openai.chat.completions.create(
              {
                model: CHAT_MODEL,
                max_tokens: 512,
                temperature: 0.9,
                stream: true,
                tool_choice: "none",
                messages: [...chatMessages, assistantMsg, ...toolResultMsgs],
              },
              { signal: abort.signal },
            );

            for await (const chunk of followUp) {
              if (abort.signal.aborted) throw new Error("Request timeout");
              const raw = chunk.choices[0]?.delta?.content;
              if (raw) {
                const text = sanitizeText(raw);
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                );
              }
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        console.error("stream error", err instanceof Error ? err.message : err);
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`
            )
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch { /* client already disconnected */ }
      } finally {
        clearTimeout(abortTimer);
      }
    },
  });

  return new Response(readable, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
