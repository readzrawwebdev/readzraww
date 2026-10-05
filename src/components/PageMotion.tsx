import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

export default function PageMotion({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const elements = document.querySelectorAll("section:not(.scroll-showcase)");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("section-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06 });
    elements.forEach((element, index) => {
      if (index === 0) return;
      element.classList.add("section-reveal");
      observer.observe(element);
    });
    return () => {
      observer.disconnect();
      elements.forEach((element) => element.classList.remove("section-reveal", "section-visible"));
    };
  }, [pathname, reduced]);
  return <motion.div key={pathname} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>{children}</motion.div>;
}