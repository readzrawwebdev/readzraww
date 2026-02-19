import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            Web Development Agency
          </span>
          <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight mb-6">
            We Build Websites
            <br />
            <span className="text-gradient">That Convert</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
            From stunning single-page sites to full-scale e-commerce platforms,
            ReadzRaw delivers professional web solutions at unbeatable prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#services"
              className="rounded-lg bg-gradient-primary px-8 py-3.5 font-semibold text-primary-foreground transition-transform hover:scale-105 shadow-glow"
            >
              View Packages
            </a>
            <a
              href="#contact"
              className="rounded-lg border border-border bg-secondary px-8 py-3.5 font-semibold text-secondary-foreground transition-colors hover:bg-surface-hover"
            >
              Contact Us
            </a>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 grid grid-cols-3 gap-8 mx-auto max-w-lg"
        >
          {[
            { num: "50+", label: "Projects" },
            { num: "100%", label: "Satisfaction" },
            { num: "5 Day", label: "Delivery" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-gradient">{s.num}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
