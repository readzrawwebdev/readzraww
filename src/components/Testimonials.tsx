import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Ahmed Raza",
    role: "Founder, TechVista",
    content: "ReadzRaw delivered our e-commerce platform in just 5 days. The design was clean, modern, and exactly what we needed. Sales increased by 40% in the first month!",
    rating: 5,
    avatar: "AR",
  },
  {
    name: "Sarah Khan",
    role: "CEO, StyleHub",
    content: "Absolutely blown away by the quality. They understood our vision perfectly and created a website that truly represents our brand. Highly recommend their Business package!",
    rating: 5,
    avatar: "SK",
  },
  {
    name: "Usman Ali",
    role: "Freelancer",
    content: "Got my portfolio site done for just $30 and it looks like it cost $500+. Fast communication, great design, and they even helped with SEO. Best investment I've made.",
    rating: 5,
    avatar: "UA",
  },
  {
    name: "Maria Tariq",
    role: "Owner, FreshBites Restaurant",
    content: "Our restaurant website looks stunning! Customers love the online menu and reservation system. ReadzRaw went above and beyond with the design and functionality.",
    rating: 5,
    avatar: "MT",
  },
  {
    name: "Hassan Sheikh",
    role: "Director, CloudSync Solutions",
    content: "Professional, fast, and affordable. Our SaaS dashboard looks world-class. The admin panel they built saves us hours of work every week. Worth every penny!",
    rating: 5,
    avatar: "HS",
  },
  {
    name: "Fatima Noor",
    role: "Blogger & Influencer",
    content: "I needed a personal brand website ASAP and ReadzRaw delivered in record time. The animations and layout are gorgeous. I get compliments on my site daily!",
    rating: 5,
    avatar: "FN",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Testimonials
          </span>
          <h2 className="mt-3 font-heading text-4xl md:text-5xl font-bold text-foreground">
            What Our <span className="text-gradient">Clients Say</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Don't just take our word for it — hear from the businesses and creators we've helped succeed online.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-colors"
            >
              <Quote size={24} className="text-primary/20 absolute top-4 right-4" />

              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold text-primary-foreground">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-heading font-semibold text-foreground text-sm">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.role}</p>
                </div>
              </div>

              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-sm text-secondary-foreground leading-relaxed">
                "{review.content}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
