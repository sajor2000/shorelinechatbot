"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MD_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)|\*\*([^*]+)\*\*|(https?:\/\/[^\s),]+)|(\b\d{3}[-.]?\d{3}[-.]?\d{4}\b)/g;

function getTimeGreeting(): string {
  const h = parseInt(
    new Date().toLocaleString("en-US", { timeZone: "America/Chicago", hour: "numeric", hour12: false })
  );
  if (h < 12) return "Good morning! How can we help?";
  if (h < 17) return "Good afternoon! How can we help?";
  return "Good evening! How can we help?";
}

function renderMarkdown(text: string, isUser: boolean): React.ReactNode[] {
  const linkClass = isUser
    ? "underline underline-offset-2 text-white/90 hover:text-white"
    : "underline underline-offset-2 text-teal-700 hover:text-teal-900";

  const parts: React.ReactNode[] = [];
  MD_PATTERN.lastIndex = 0;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = MD_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] && match[2]) {
      parts.push(
        <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer" className={linkClass}>{match[1]}</a>
      );
    } else if (match[3]) {
      parts.push(<strong key={key++} className="font-semibold">{match[3]}</strong>);
    } else if (match[4]) {
      parts.push(
        <a key={key++} href={match[4]} target="_blank" rel="noopener noreferrer" className={linkClass}>{match[4]}</a>
      );
    } else if (match[5]) {
      const digits = match[5].replace(/\D/g, "");
      parts.push(
        <a key={key++} href={`tel:${digits}`} className={linkClass}>{match[5]}</a>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

const PAGE_OPTIONS = [
  { value: "/", label: "Homepage" },
  { value: "/services", label: "All Services" },
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
  { value: "/services/general-family-dentistry/dental-sealants", label: "Dental Sealants" },
  { value: "/services/general-family-dentistry/fluoride-treatments", label: "Fluoride Treatments" },
  { value: "/services/general-family-dentistry/sports-mouthguards", label: "Sports Mouth Guards" },
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
  { value: "/services/restorative-dentistry/dental-inlays-onlays", label: "Inlays & Onlays" },
  { value: "/services/restorative-dentistry/dental-bridges", label: "Dental Bridges" },
  { value: "/services/restorative-dentistry/scaling-root-planing", label: "Scaling & Root Planing" },
  { value: "/about", label: "About" },
  { value: "/about/meet-our-team", label: "Meet Our Team" },
  { value: "/about/office-tour", label: "Office Tour" },
  { value: "/contact", label: "Contact" },
  { value: "/contact-us", label: "Contact Us" },
  { value: "/patient-resources", label: "Patient Resources" },
  { value: "/patient-resources/financial-options", label: "Financial Options" },
  { value: "/patient-resources/special-offers", label: "Special Offers" },
  { value: "/patient-resources/reviews", label: "Reviews" },
  { value: "/patient-resources/gallery", label: "Gallery" },
];

const DEFAULT_SUGGESTIONS = [
  "What are your hours?",
  "How do I book an appointment?",
  "Do you take my insurance?",
  "What's the new patient special?",
  "I have a dental emergency",
];

const PAGE_SUGGESTIONS: Record<string, string[]> = {
  "/": DEFAULT_SUGGESTIONS,
  "/services": [
    "What services do you offer?",
    "How do I book an appointment?",
    "Do you take my insurance?",
    "What's the new patient special?",
  ],
  "/services/cosmetic-dentistry": [
    "What cosmetic services do you offer?",
    "Can I schedule a consultation?",
    "Do you take my insurance?",
    "What's the new patient special?",
  ],
  "/services/cosmetic-dentistry/dental-veneers": [
    "How do I get started with veneers?",
    "Can I schedule a consultation?",
    "Do you take my insurance for this?",
    "What's the new patient special?",
  ],
  "/services/cosmetic-dentistry/dental-bonding": [
    "How do I get started with bonding?",
    "Can I schedule a consultation?",
    "Do you take my insurance?",
    "What's the new patient special?",
  ],
  "/services/cosmetic-dentistry/teeth-whitening": [
    "How do I book a whitening appointment?",
    "What whitening options do you have?",
    "Do you take my insurance?",
    "What does it cost?",
  ],
  "/services/cosmetic-dentistry/orthodontics": [
    "Do you offer Invisalign?",
    "How do I get started with orthodontics?",
    "Do you take my insurance for this?",
    "Can I schedule a consultation?",
  ],
  "/services/general-family-dentistry": [
    "How do I book a cleaning?",
    "What are your hours?",
    "Do you take my insurance?",
    "What's the new patient special?",
  ],
  "/services/general-family-dentistry/dental-cleanings": [
    "How do I book a cleaning?",
    "Are cleanings really $0 with insurance?",
    "Do you take my insurance?",
    "What's the new patient special?",
  ],
  "/services/general-family-dentistry/emergency-dentistry": [
    "I have a dental emergency",
    "Are you open right now?",
    "What's your phone number?",
    "How quickly can I be seen?",
  ],
  "/services/oral-surgery": [
    "Tell me about dental implants",
    "Can I schedule a consultation?",
    "Do you take my insurance?",
    "What's the new patient special?",
  ],
  "/services/oral-surgery/dental-implants": [
    "How do I get started with implants?",
    "Can I schedule a consultation?",
    "Do you take my insurance for implants?",
    "What financing options are available?",
  ],
  "/services/restorative-dentistry": [
    "What restorative options do you have?",
    "Can I schedule a consultation?",
    "Do you take my insurance?",
    "What's the new patient special?",
  ],
  "/contact": [
    "I'd like to schedule an appointment",
    "What are your hours?",
    "Where are you located?",
    "Is there parking nearby?",
  ],
  "/contact-us": [
    "I'd like to schedule an appointment",
    "What are your hours?",
    "Where are you located?",
    "Is there parking nearby?",
  ],
  "/patient-resources/financial-options": [
    "What's the new patient special?",
    "Do you offer payment plans?",
    "Do you take my insurance?",
    "Tell me about Cherry Financing",
  ],
  "/patient-resources/special-offers": [
    "What's the new patient special?",
    "Are cleanings really $0 with insurance?",
    "Do you offer payment plans?",
    "How do I book an appointment?",
  ],
  "/about/meet-our-team": [
    "Tell me about Dr. Rojas",
    "Tell me about Dr. Patel",
    "How do I book an appointment?",
    "Do you take my insurance?",
  ],
};

function getSuggestions(pageUrl: string): string[] {
  if (PAGE_SUGGESTIONS[pageUrl]) return PAGE_SUGGESTIONS[pageUrl];
  const parent = pageUrl.split("/").slice(0, -1).join("/");
  if (parent && PAGE_SUGGESTIONS[parent]) return PAGE_SUGGESTIONS[parent];
  return DEFAULT_SUGGESTIONS;
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const [showTestBar, setShowTestBar] = useState(true);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pageUrlRef = useRef(pageUrl);

  useEffect(() => {
    pageUrlRef.current = pageUrl;
  }, [pageUrl]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page");
    if (page) {
      setPageUrl(page);
      setShowTestBar(false);
      pageUrlRef.current = page;
    }

    const timer = setTimeout(async () => {
      setStreaming(true);
      setMessages([{ role: "assistant", content: "" }]);
      const fallback = "Hi there! Welcome to Shoreline Dental. How can I help you today?";
      try {
        const currentPage = pageUrlRef.current;
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "[GREETING]" }],
            ...(currentPage && { pageUrl: currentPage }),
          }),
        });
        if (!res.ok) {
          setMessages([{ role: "user", content: "[GREETING]" }, { role: "assistant", content: fallback }]);
          return;
        }
        const reader = res.body?.getReader();
        if (!reader) return;
        try {
          const decoder = new TextDecoder();
          let text = "";
          let buffer = "";
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
                if (data.text) {
                  text += data.text;
                  setMessages([{ role: "user", content: "[GREETING]" }, { role: "assistant", content: text }]);
                }
                if (data.suggestions) {
                  setFollowUpSuggestions(data.suggestions.filter((s: unknown): s is string => typeof s === "string").map((s: string) => s.slice(0, 80)).slice(0, 2));
                }
              } catch { /* partial chunk */ }
            }
          }
          if (!text) {
            setMessages([{ role: "user", content: "[GREETING]" }, { role: "assistant", content: fallback }]);
          }
        } finally {
          reader.releaseLock();
        }
      } catch {
        setMessages([{ role: "user", content: "[GREETING]" }, { role: "assistant", content: fallback }]);
      } finally {
        setStreaming(false);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;

    setFollowUpSuggestions([]);
    const userMsg: Message = { role: "user", content };
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
        } catch { /* non-JSON body */ }
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${errorMsg}` }]);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      try {
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
                  next[next.length - 1] = { role: "assistant", content: assistantText || "Sorry, something went wrong." };
                  return next;
                });
                break outer;
              }
              if (data.text) {
                assistantText += data.text;
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = { role: "assistant", content: assistantText };
                  return next;
                });
              }
              if (data.suggestions) {
                setFollowUpSuggestions(data.suggestions.filter((s: unknown): s is string => typeof s === "string").map((s: string) => s.slice(0, 80)).slice(0, 2));
              }
            } catch { /* partial chunk */ }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant") {
          next[next.length - 1] = { role: "assistant", content: last.content || "Sorry, something went wrong." };
        } else {
          next.push({ role: "assistant", content: "Sorry, something went wrong." });
        }
        return next;
      });
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }, [input, messages, streaming, pageUrl]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 p-4">

      {/* Test controls bar */}
      {showTestBar && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 py-2 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-300">Test Mode</span>
            <span className="text-slate-500">|</span>
            <label className="text-slate-400">
              Simulated page:
              <select
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                className="ml-2 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 max-w-[180px]"
              >
                {PAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>
          <button onClick={() => setShowTestBar(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
            Hide
          </button>
        </div>
      )}

      {/* Chat widget container */}
      <div
        className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl shadow-slate-900/10 flex flex-col overflow-hidden border border-slate-200/60"
        style={{ height: "min(680px, calc(100vh - 2rem))" }}
      >

        {/* Header */}
        <header className="bg-gradient-to-r from-teal-600 to-teal-700 px-5 py-4 flex items-center gap-3.5 shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-1-3H7l3-8h2l3 8h-2l-1 3h-2zm2-6.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor" opacity="0.9"/>
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-semibold text-[15px] leading-tight tracking-tight">
              Shoreline Dental Chicago
            </h1>
            <p className="text-teal-100/80 text-xs mt-0.5">
              {streaming ? (
                <span className="flex items-center gap-1.5">
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-teal-200 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 bg-teal-200 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 bg-teal-200 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                  Typing
                </span>
              ) : getTimeGreeting()}
            </p>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollBehavior: "smooth" }}>

          {messages.filter(m => !(m.role === "user" && m.content === "[GREETING]")).map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slideUp`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-1-3H7l3-8h2l3 8h-2l-1 3h-2z" fill="currentColor" opacity="0.9"/>
                  </svg>
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-teal-600 text-white rounded-br-md"
                    : "bg-slate-100 text-slate-800 rounded-bl-md"
                }`}
              >
                {msg.content ? (
                  <span className="whitespace-pre-wrap">
                    {renderMarkdown(msg.content, msg.role === "user")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 py-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                )}
              </div>
            </div>
          ))}

          {messages.length === 2 && messages[0].role === "user" && messages[0].content === "[GREETING]" && messages[1].role === "assistant" && messages[1].content && !streaming && (
            <div className="w-full space-y-2 animate-fadeIn">
              {getSuggestions(pageUrl).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left text-sm text-slate-700 bg-slate-50 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 hover:border-teal-200 rounded-xl px-4 py-2.5 transition-all duration-150 active:scale-[0.98]"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {followUpSuggestions.length > 0 && !streaming && (
            <div className="flex flex-wrap gap-2 ml-9 animate-fadeIn">
              {followUpSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-full px-3 py-1.5 transition-all duration-150 active:scale-[0.98]"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-100 bg-white px-3 py-3 shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-300 transition-all"
              disabled={streaming}
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="w-10 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
              </svg>
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Shoreline Dental Chicago &middot; 737 N Michigan Ave
          </p>
        </div>
      </div>
    </div>
  );
}
