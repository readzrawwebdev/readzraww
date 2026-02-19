import { motion } from "framer-motion";

const items = [
  { title: "E-Commerce Store", category: "Premium", color: "from-primary to-glow-accent" },
  { title: "Restaurant Website", category: "Business", color: "from-glow-accent to-primary" },
  { title: "Personal Portfolio", category: "Starter", color: "from-primary to-primary" },
  { title: "SaaS Dashboard", category: "Premium", color: "from-glow-accent to-glow-accent" },
  { title: "Clinic Landing Page", category: "Business", color: "from-primary to-glow-accent" },
  { title: "Event Page", category: "Starter", color: "from-glow-accent to-primary" },
];

const Portfolio = () => {
  return (
    <section id="portfolio" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Portfolio
          </span>
          <h2 className="mt-3 font-heading text-4xl md:text-5xl font-bold text-foreground">
            Our <span className="text-gradient">Recent Work</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group relative rounded-xl border border-border bg-secondary overflow-hidden cursor-pointer"
            >
              <div className={`h-48 bg-gradient-to-br ${item.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <span className="text-xs font-medium text-primary mb-1">{item.category}</span>
                <h3 className="font-heading text-lg font-bold text-foreground">{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
