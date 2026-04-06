import { motion } from "framer-motion";
import { Check } from "lucide-react";

export interface ServicePlan {
  id: string;
  title: string;
  price: number;
  description: string;
  features: string[];
  examples: string[];
  popular?: boolean;
}

interface Props {
  plan: ServicePlan;
  index: number;
  onBuy: (plan: ServicePlan) => void;
}

const ServiceCard = ({ plan, index, onBuy }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={`relative rounded-2xl border p-8 flex flex-col shadow-card ${
        plan.popular
          ? "border-primary/40 bg-primary/[0.03] shadow-glow"
          : "border-border bg-card"
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-4 py-1 text-xs font-bold text-primary-foreground">
          Most Popular
        </span>
      )}

      <h3 className="font-heading text-xl font-bold text-foreground">{plan.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

      <div className="mt-6 mb-6">
        <span className="text-4xl font-bold text-gradient">${plan.price}</span>
        <span className="text-muted-foreground ml-1 text-sm">/ project</span>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check size={16} className="mt-0.5 shrink-0 text-accent" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Example projects
        </p>
        <div className="flex flex-wrap gap-2">
          {plan.examples.map((e) => (
            <span key={e} className="rounded-md bg-muted px-3 py-1 text-xs text-foreground">
              {e}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => onBuy(plan)}
        className={`w-full rounded-lg py-3 font-semibold transition-transform hover:scale-[1.02] ${
          plan.popular
            ? "bg-gradient-primary text-primary-foreground shadow-glow"
            : "bg-muted text-foreground hover:bg-muted/80"
        }`}
      >
        Buy Now — ${plan.price}
      </button>
    </motion.div>
  );
};

export default ServiceCard;
