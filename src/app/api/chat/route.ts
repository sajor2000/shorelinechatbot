import OpenAI from "openai";
import { type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { saveLead } from "@/lib/leads";

const ALLOWED_ORIGINS = [
  "https://www.shorelinedentalchicago.com",
  "https://shorelinedentalchicago.com",
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000"] : []),
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
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
      console.error("rate-limiter error, failing open", err instanceof Error ? err.message : err);
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

  let body: { messages: unknown[] };
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

  const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ];

  let stream;
  try {
    stream = await openai.chat.completions.create({
      model: CHAT_MODEL,
      max_tokens: 512,
      stream: true,
      tools: TOOLS,
      messages: chatMessages,
    });
  } catch (err) {
    console.error("upstream error", err instanceof Error ? err.message : err);
    return Response.json(
      { error: "Upstream API unavailable" },
      { status: 502, headers: corsHeaders }
    );
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        const pendingToolCalls = new Map<
          number,
          { id: string; name: string; args: string }
        >();

        for await (const chunk of stream) {
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

          const text = delta?.content;
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }

        if (pendingToolCalls.size > 0) {
          const toolCalls = Array.from(pendingToolCalls.values());
          const toolResultMsgs: OpenAI.ChatCompletionToolMessageParam[] = [];

          for (const tc of toolCalls) {
            let toolSuccess = true;
            if (tc.name === "capture_lead") {
              try {
                const args = JSON.parse(tc.args);
                if (
                  typeof args !== "object" ||
                  args === null ||
                  typeof args.reason !== "string"
                ) {
                  throw new Error("Invalid tool call arguments");
                }
                await saveLead({
                  name: typeof args.name === "string" ? args.name : undefined,
                  email:
                    typeof args.email === "string" ? args.email : undefined,
                  phone:
                    typeof args.phone === "string" ? args.phone : undefined,
                  reason: args.reason,
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
            }
            toolResultMsgs.push({
              role: "tool",
              tool_call_id: tc.id,
              content: JSON.stringify({ success: toolSuccess }),
            });
          }

          const assistantMsg: OpenAI.ChatCompletionAssistantMessageParam = {
            role: "assistant",
            tool_calls: toolCalls.map((tc) => ({
              id: tc.id,
              type: "function" as const,
              function: { name: tc.name, arguments: tc.args },
            })),
          };

          const followUp = await openai.chat.completions.create({
            model: CHAT_MODEL,
            max_tokens: 512,
            stream: true,
            tool_choice: "none",
            messages: [...chatMessages, assistantMsg, ...toolResultMsgs],
          });

          for await (const chunk of followUp) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
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
