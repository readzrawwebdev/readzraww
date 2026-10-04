import mark from "@/assets/readzraw-mark.png";

const Founder = () => (
  <section id="about" className="py-20">
    <div className="container mx-auto px-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 md:p-10 shadow-card">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <img src={mark} alt="Rehan, founder of ReadzRaw" className="h-24 w-24 shrink-0 rounded-2xl border border-border object-contain p-2" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Meet the Founder</p>
            <h2 className="mt-1 font-heading text-3xl font-bold text-foreground">Rehan</h2>
            <p className="text-sm text-muted-foreground">Founder & CEO, ReadzRaw</p>
            <p className="mt-4 text-foreground/90">
              A passionate 14-year-old web developer building modern, fast, conversion-focused websites
              for growing brands and businesses. Every project gets personal attention from idea to launch.
            </p>
          </div>
        </div>
        <p className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
          Engineered with modern AI-accelerated workflows and perfected by hand — every design, page and
          mobile layout is personally reviewed so you get agency quality without agency prices.
        </p>
      </div>
    </div>
  </section>
);

export default Founder;
