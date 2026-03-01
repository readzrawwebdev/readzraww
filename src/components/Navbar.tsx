import { useState } from "react";
import { Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();

  const links = [
    { label: "Services", href: "#services" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="#" className="font-heading text-2xl font-bold text-gradient">
          ReadzRaw
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          {!loading && user ? (
            <a
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              <User size={16} /> Dashboard
            </a>
          ) : (
            <a
              href="/login"
              className="rounded-lg bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              Sign In
            </a>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-4 p-6">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-foreground font-medium"
                >
                  {l.label}
                </a>
              ))}
              {!loading && user ? (
                <a
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  <User size={16} /> Dashboard
                </a>
              ) : (
                <a
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-gradient-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                >
                  Sign In
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
