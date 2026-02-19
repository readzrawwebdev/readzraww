import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_REPLIES = [
  "What packages do you offer?",
  "How does payment work?",
  "How long does delivery take?",
  "I need a custom project",
];

const BOT_RESPONSES: Record<string, string> = {
  "what packages do you offer?":
    "We offer 3 packages:\n\n🟢 **Starter ($30)** — 1-page website, perfect for portfolios & landing pages.\n\n🔵 **Business ($100)** — 4-page website for businesses with Home, About, Services & Contact.\n\n🟡 **Premium ($250)** — 10-page website with payment gateway, admin dashboard & more.\n\nScroll up to see full details!",
  "how does payment work?":
    "Easy! Pay **50% advance** via EasyPaisa to **0334 1275358**, upload the receipt, and we start working. The remaining 50% is due on delivery. 💳",
  "how long does delivery take?":
    "All our packages are delivered within **5 business days**. Premium projects may take a bit longer depending on complexity. ⚡",
  "i need a custom project":
    "We'd love to help! Email us at **readzraw@gmail.com** with your project details and we'll send you a custom quote within 24 hours. 📧",
};

const getResponse = (msg: string): string => {
  const lower = msg.toLowerCase().trim();
  for (const [key, val] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(key) || key.includes(lower)) return val;
  }
  if (lower.includes("price") || lower.includes("cost"))
    return BOT_RESPONSES["what packages do you offer?"];
  if (lower.includes("pay") || lower.includes("easypaisa"))
    return BOT_RESPONSES["how does payment work?"];
  if (lower.includes("time") || lower.includes("deliver") || lower.includes("days"))
    return BOT_RESPONSES["how long does delivery take?"];
  if (lower.includes("custom") || lower.includes("special"))
    return BOT_RESPONSES["i need a custom project"];
  return "Thanks for your message! For specific questions, email us at **readzraw@gmail.com** or call us. We're happy to help! 😊";
};

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm the ReadzRaw assistant. How can I help you today? Ask me about our packages, pricing, or delivery!",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const reply: Message = { role: "assistant", content: getResponse(text) };
      setMessages((prev) => [...prev, reply]);
    }, 600);
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow transition-transform hover:scale-110"
        whileTap={{ scale: 0.95 }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card shadow-card overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-primary px-5 py-4">
              <h3 className="font-heading font-bold text-primary-foreground">
                ReadzRaw Assistant
              </h3>
              <p className="text-xs text-primary-foreground/70">
                Ask me anything about our services
              </p>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-secondary-foreground rounded-bl-md"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick replies */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground hover:bg-surface-hover transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-input bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={() => send(input)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
