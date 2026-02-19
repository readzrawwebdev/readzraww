import ServiceCard, { ServicePlan } from "./ServiceCard";

const plans: ServicePlan[] = [
  {
    id: "starter",
    title: "Starter — 1 Page",
    price: 30,
    description:
      "A sleek single-page website perfect for personal portfolios, landing pages, or event pages. Fast delivery and mobile-responsive.",
    features: [
      "Fully responsive design",
      "Modern UI / UX",
      "Contact form integration",
      "SEO optimized",
      "1 revision round",
      "Delivered in 5 days",
    ],
    examples: ["Portfolio", "Resume Site", "Event Page", "Link-in-Bio"],
  },
  {
    id: "business",
    title: "Business — 4 Pages",
    price: 100,
    popular: true,
    description:
      "A complete business website with multiple pages — Home, About, Services, and Contact. Ideal for small businesses and startups looking for a professional online presence.",
    features: [
      "4 custom-designed pages",
      "Responsive on all devices",
      "Blog-ready layout",
      "Social media integration",
      "Google Maps & analytics",
      "3 revision rounds",
      "Delivered in 5 days",
    ],
    examples: ["Restaurant Site", "Agency Site", "Clinic Website", "Startup Landing"],
  },
  {
    id: "premium",
    title: "Premium — 10 Pages",
    price: 250,
    description:
      "A full-scale website with up to 10 pages, payment gateway integration (Stripe / JazzCash / EasyPaisa), product listings, and admin dashboard. Perfect for e-commerce and SaaS businesses.",
    features: [
      "Up to 10 custom pages",
      "Payment gateway (Stripe/JazzCash/EasyPaisa)",
      "Product / service listings",
      "Admin dashboard",
      "User authentication",
      "Email notifications",
      "5 revision rounds",
      "Priority support",
      "Delivered in 5 days",
    ],
    examples: ["E-commerce Store", "SaaS Platform", "Booking System", "Online Course"],
  },
];

interface Props {
  onBuy: (plan: ServicePlan) => void;
}

const Services = ({ onBuy }: Props) => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Our Packages
          </span>
          <h2 className="mt-3 font-heading text-4xl md:text-5xl font-bold text-foreground">
            Choose Your <span className="text-gradient">Perfect Plan</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Transparent pricing with no hidden fees. Pay 50% upfront and the rest on delivery.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <ServiceCard key={plan.id} plan={plan} index={i} onBuy={onBuy} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
