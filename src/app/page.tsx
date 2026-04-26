"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PAGE_OPTIONS = [
  { value: "", label: "No page context (default)" },
  { value: "/services/cosmetic-dentistry", label: "Cosmetic Dentistry" },
  { value: "/services/cosmetic-dentistry/dental-veneers", label: "Dental Veneers" },
  { value: "/services/cosmetic-dentistry/dental-bonding", label: "Dental Bonding" },
  { value: "/services/cosmetic-dentistry/teeth-whitening", label: "Teeth Whitening" },
  { value: "/services/cosmetic-dentistry/orthodontics", label: "Orthodontics" },
  { value: "/services/cosmetic-dentistry/full-mouth-rehabilitation", label: "Full-Mouth Rehab" },
  { value: "/services/general-family-dentistry", label: "General & Family" },
  { value: "/services/general-family-dentistry/dental-cleanings", label: "Dental Cleanings" },
  { value: "/services/general-family-dentistry/emergency-dentistry", label: "Emergency Dentistry" },
  { value: "/services/general-family-dentistry/sleep-apnea-treatment", label: "Sleep Apnea" },
  { value: "/services/general-family-dentistry/night-guards", label: "Night Guards" },
  { value: "/services/oral-surgery", label: "Oral Surgery" },
  { value: "/services/oral-surgery/dental-implants", label: "Dental Implants" },
  { value: "/services/oral-surgery/all-on-4-dental-implants", label: "All-on-4 Implants" },
  { value: "/services/oral-surgery/implant-supported-dentures", label: "Implant-Supported Dentures" },
  { value: "/services/oral-surgery/tooth-extractions", label: "Tooth Extractions" },
  { value: "/services/restorative-dentistry", label: "Restorative Dentistry" },
  { value: "/services/restorative-dentistry/dental-crowns", label: "Dental Crowns" },
  { value: "/services/restorative-dentistry/dental-fillings", label: "Dental Fillings" },
  { value: "/services/restorative-dentistry/root-canal-treatments", label: "Root Canal" },
  { value: "/services/restorative-dentistry/dentures", label: "Dentures" },
  { value: "/services/restorative-dentistry/gum-disease-treatment", label: "Gum Disease" },
  { value: "/about/meet-our-team", label: "Meet Our Team" },
  { value: "/patient-resources/financial-options", label: "Financial Options" },
  { value: "/patient-resources/special-offers", label: "Special Offers" },
  { value: "/contact-us", label: "Contact Us" },
];

export default function ChatTest() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, ...(pageUrl && { pageUrl }) }),
      });

      if (!res.ok) {
        let errorMsg = `Request failed (${res.status})`;
        try {
          const err = await res.json();
          if (err.error) errorMsg = err.error;
        } catch { /* non-JSON error body */ }
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${errorMsg}` },
        ]);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let assistantText = "";
      let buffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") break outer;

          try {
            const data = JSON.parse(payload);
            if (data.error) {
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  role: "assistant",
                  content:
                    assistantText ||
                    "Sorry, something went wrong. Please try again.",
                };
                return next;
              });
              break outer;
            }
            if (data.text) {
              assistantText += data.text;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {
                  role: "assistant",
                  content: assistantText,
                };
                return next;
              });
            }
          } catch {
            // partial JSON from chunk boundary — will reassemble on next read
          }
        }
      }

      reader.releaseLock();
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        const lastIsAssistant =
          next.length > 0 && next[next.length - 1].role === "assistant";
        if (lastIsAssistant) {
          next[next.length - 1] = {
            role: "assistant",
            content:
              next[next.length - 1].content ||
              "Sorry, something went wrong. Please try again.",
          };
        } else {
          next.push({
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
          });
        }
        return next;
      });
    } finally {
      setStreaming(false);
    }
  }, [input, messages, streaming]);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Shoreline Dental Chat — Test Console
            </h1>
            <p className="text-sm text-gray-500">
              Simulate page context the widget would send from the website.
            </p>
          </div>
          <select
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-gray-700 max-w-[200px]"
          >
            {PAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-4xl mb-2">🦷</p>
            <p>Send a message to test the Shoreline Dental assistant.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                "What are your hours?",
                "Do you do implants?",
                "How do I book an appointment?",
                "I have a dental emergency",
                "Where are you located?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs border border-gray-300 rounded-full px-3 py-1.5 hover:bg-gray-50 text-gray-600"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {msg.content || (
                <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse rounded-sm" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 px-6 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={streaming}
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {streaming ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
