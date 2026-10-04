import { MessageSquare, Wallet, Palette, Rocket } from "lucide-react";

const steps = [
  { icon: MessageSquare, title: "Consultation", desc: "We discuss your goals, audience and features — free, on WhatsApp or call." },
  { icon: Wallet, title: "50% Advance", desc: "Pay half via EasyPaisa, submit your TRX ID and get an official invoice." },
  { icon: Palette, title: "Design & Development", desc: "We design and build your site with regular preview updates for feedback." },
  { icon: Rocket, title: "Launch", desc: "Pay the balance, and your website goes live — delivered within 15 days." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24">
    <div className="container mx-auto px-4">
      <div className="mb-14 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">Process</p>
        <h2 className="text-3xl font-bold text-foreground md:text-4xl">How It Works</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.title} className="relative rounded-2xl border border-border bg-card p-6 shadow-card">
            <span className="absolute right-4 top-4 text-4xl font-bold text-muted-foreground/20">0{i + 1}</span>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
              <s.icon size={22} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
