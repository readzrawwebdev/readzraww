import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Heart, Trash2, ShoppingCart } from "lucide-react";

interface WishlistItem {
  title: string;
  price: number;
  features: string[];
}

const AVAILABLE_PLANS: WishlistItem[] = [
  {
    title: "Starter",
    price: 30,
    features: ["1-page website", "Responsive design", "Contact form", "SEO basics"],
  },
  {
    title: "Business",
    price: 100,
    features: ["4+ pages", "Blog-ready", "Google Analytics", "Social integration"],
  },
  {
    title: "Premium",
    price: 250,
    features: ["10 pages", "Payment gateway", "Admin dashboard", "User auth"],
  },
];

const STORAGE_KEY = "readzraw_wishlist";

const DashboardWishlist = () => {
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const toggle = (title: string) => {
    setWishlist((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const wishlisted = AVAILABLE_PLANS.filter((p) => wishlist.includes(p.title));
  const notWishlisted = AVAILABLE_PLANS.filter((p) => !wishlist.includes(p.title));

  return (
    <DashboardLayout title="Wishlist">
      <p className="text-sm text-muted-foreground mb-6">
        Save plans you're interested in for later.
      </p>

      {wishlisted.length > 0 && (
        <div className="mb-8">
          <h3 className="font-heading text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
            Saved Plans ({wishlisted.length})
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlisted.map((plan) => (
              <div key={plan.title} className="rounded-xl border border-primary/20 bg-card p-5 relative">
                <Heart size={16} className="absolute top-4 right-4 text-primary fill-primary" />
                <h4 className="font-heading text-lg font-bold text-foreground">{plan.title}</h4>
                <p className="text-2xl font-bold text-gradient mt-1">${plan.price}</p>
                <ul className="mt-3 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 mt-4">
                  <a
                    href="/#services"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <ShoppingCart size={12} /> Order Now
                  </a>
                  <button
                    onClick={() => toggle(plan.title)}
                    className="flex items-center justify-center rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notWishlisted.length > 0 && (
        <div>
          <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Available Plans
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notWishlisted.map((plan) => (
              <div key={plan.title} className="rounded-xl border border-border bg-card p-5">
                <h4 className="font-heading text-lg font-bold text-foreground">{plan.title}</h4>
                <p className="text-2xl font-bold text-foreground/60 mt-1">${plan.price}</p>
                <ul className="mt-3 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => toggle(plan.title)}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  <Heart size={12} /> Add to Wishlist
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardWishlist;
