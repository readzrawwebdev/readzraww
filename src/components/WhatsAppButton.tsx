import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => (
  <a
    href="https://wa.me/923341275358?text=Assalam%20o%20Alaikum%20ReadzRaw!%20I%20want%20a%20website."
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
    className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-glow transition-transform hover:scale-105"
  >
    <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent/40" />
    <MessageCircle size={20} />
    <span className="hidden sm:inline">WhatsApp</span>
  </a>
);

export default WhatsAppButton;
