import { useEffect, useId, useRef, useState } from "react";
import { track } from "@/lib/analytics";

const QUICK_ACTIONS = [
  "Help me choose a category",
  "Find a fictional provider",
  "Compare providers",
  "Start the quote-request demo",
  "List a business",
  "Build a directory like this",
];

type Message = { role: "user" | "assistant"; content: string };

export default function AssistantWidget() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "AI matching assistant in a fictional directory demonstration created by Che Xu Studio. Ask about categories, comparison, quote demos or building a platform like this.",
    },
  ]);
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) track("ai_assistant_opened");
  }, [open]);

  async function send(content: string) {
    const trimmed = content.trim();
    if (!trimmed || busy) return;
    if (/build a directory like this/i.test(trimmed)) {
      window.dispatchEvent(new CustomEvent("localpro:open-enquiry"));
    }
    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-8) }),
      });
      const data = (await res.json()) as { ok?: boolean; reply?: string; error?: string };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || data.error || "Unable to respond right now.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Unable to respond right now." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40" style={{ marginBottom: "var(--safe-bottom)" }}>
      {!open && (
        <button type="button" className="btn-primary shadow-raised" onClick={() => setOpen(true)}>
          Assistant
        </button>
      )}
      {open && (
        <div
          ref={panelRef}
          className="flex h-[min(70vh,32rem)] w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-xl border border-navy/10 bg-white shadow-raised"
          role="dialog"
          aria-labelledby={titleId}
        >
          <div className="flex items-start justify-between gap-2 border-b border-navy/10 px-4 py-3">
            <div>
              <h2 id={titleId} className="text-sm font-bold text-navy">
                Matching assistant
              </h2>
              <p className="mt-1 text-xs text-muted">
                AI matching assistant in a fictional directory demonstration created by Che Xu Studio.
              </p>
            </div>
            <button type="button" className="btn-ghost min-h-10 px-2 text-xs" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <div className="flex flex-wrap gap-2 border-b border-navy/10 px-3 py-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                className="rounded-md border border-navy/10 bg-cloud px-2 py-1 text-[11px] font-semibold text-navy"
                onClick={() => void send(action)}
              >
                {action}
              </button>
            ))}
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-lg px-3 py-2 text-sm ${
                  message.role === "assistant" ? "bg-cloud text-charcoal" : "bg-search-light text-navy"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>
          <form
            className="flex gap-2 border-t border-navy/10 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <label className="sr-only" htmlFor="assistant-input">
              Message
            </label>
            <input
              id="assistant-input"
              className="input"
              value={input}
              maxLength={500}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this demo"
            />
            <button type="submit" className="btn-primary" disabled={busy}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
