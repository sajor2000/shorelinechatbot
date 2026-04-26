"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MD_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)|\*\*([^*]+)\*\*|(https?:\/\/[^\s),]+)|(\b\d{3}[-.]?\d{3}[-.]?\d{4}\b)/g;

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

const SUGGESTIONS = [
  "What are your hours?",
  "How do I book an appointment?",
  "Do you take my insurance?",
  "Tell me about teeth whitening",
  "I have a dental emergency",
];

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const [showTestBar, setShowTestBar] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;

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
          } catch { /* partial chunk */ }
        }
      }
      reader.releaseLock();
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
              ) : "Hi! How can we help you today?"}
            </p>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollBehavior: "smooth" }}>

          {messages.length === 0 && (
            <div className="flex flex-col items-center pt-8 pb-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-teal-600">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" fill="currentColor"/>
                  <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" fill="currentColor"/>
                </svg>
              </div>
              <p className="text-slate-800 font-medium text-[15px] mb-1">
                Welcome to Shoreline Dental
              </p>
              <p className="text-slate-500 text-xs text-center leading-relaxed max-w-[280px] mb-6">
                Ask us about appointments, services, insurance, or anything else. We&apos;re here to help!
              </p>
              <div className="w-full space-y-2">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left text-sm text-slate-700 bg-slate-50 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 hover:border-teal-200 rounded-xl px-4 py-2.5 transition-all duration-150 active:scale-[0.98]"
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
            Powered by Shoreline Dental Chicago
          </p>
        </div>
      </div>
    </div>
  );
}
