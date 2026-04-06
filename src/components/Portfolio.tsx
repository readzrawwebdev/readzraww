import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const items = [
  { title: "E-Commerce Store", category: "Premium", color: "from-primary/20 to-accent/20", url: "https://store.google.com" },
  { title: "Restaurant Website", category: "Business", color: "from-accent/20 to-primary/20", url: "https://www.thefork.com" },
  { title: "Personal Portfolio", category: "Starter", color: "from-primary/15 to-primary/25", url: "https://brittanychiang.com" },
  { title: "SaaS Dashboard", category: "Premium", color: "from-accent/15 to-accent/25", url: "https://linear.app" },
  { title: "Clinic Landing Page", category: "Business", color: "from-primary/20 to-accent/15", url: "https://www.onemedical.com" },
  { title: "Event Page", category: "Starter", color: "from-accent/15 to-primary/20", url: "https://lu.ma" },
];

const Portfolio = () => {
  return (
    <section id="portfolio" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Portfolio
          </span>
          <h2 className="mt-3 font-heading text-4xl md:text-5xl font-bold text-foreground">
            Our <span className="text-gradient">Recent Work</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            A showcase of websites we've built for happy clients across different industries.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <motion.a
              key={item.title}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative rounded-xl border border-border bg-card overflow-hidden cursor-pointer block shadow-card hover:shadow-lg transition-shadow"
            >
              <div className={`h-48 bg-gradient-to-br ${item.color}`} />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-primary/10 px-3 py-0.5 text-[10px] font-semibold text-primary mb-2">
                      {item.category}
                    </span>
                    <h3 className="font-heading text-lg font-bold text-foreground">{item.title}</h3>
                  </div>
                  <ExternalLink size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
