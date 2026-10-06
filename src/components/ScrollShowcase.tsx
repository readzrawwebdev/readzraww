import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import preview from "@/assets/neon-showcase.asset.json";
import poster from "@/assets/neon-poster.asset.json";

const stages = ["Design", "Development", "Launch"];

export default function ScrollShowcase() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef(0);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [0.78, 1, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [14, 0]);
  const sideX = useTransform(scrollYProgress, [0, 0.65], [65, 0]);
  const sideY = useTransform(scrollYProgress, [0, 0.65], [40, 0]);
  const syncVideo = (progress: number) => {
    const element = video.current;
    if (reduced || !element || !Number.isFinite(element.duration)) return;
    const target = progress * Math.max(0, element.duration - 0.08);
    if (Math.abs(element.currentTime - target) > 0.035) element.currentTime = target;
  };
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setActive(Math.min(2, Math.floor(progress * 3)));
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => syncVideo(progress));
  });
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const selectStage = (index: number) => {
    const element = section.current;
    if (!element) return;
    if (reduced) {
      setActive(index);
      const media = video.current;
      if (media && Number.isFinite(media.duration)) media.currentTime = media.duration * index / 3;
      return;
    }
    const start = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: start + (element.offsetHeight - window.innerHeight) * (index + 0.35) / 3, behavior: "smooth" });
  };

  return (
    <section ref={section} className="scroll-showcase relative" aria-label="ReadzRaw creative showcase">
      <div className="showcase-sticky flex flex-col items-center justify-center overflow-hidden px-4 py-20">
        <div className="mb-7 text-center">
          <p className="neon-accent text-xs font-semibold uppercase text-accent">From idea to live</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Your next chapter. Built by <span className="neon-title">ReadzRaw.</span></h2>
        </div>
        <div className="showcase-perspective relative w-full max-w-4xl">
          <motion.div style={reduced ? undefined : { x: sideX, y: sideY }} className="showcase-layer absolute inset-0 translate-x-3 translate-y-3 border border-accent/30 bg-surface" />
          <motion.div style={reduced ? undefined : { scale, rotateX }} className="relative overflow-hidden rounded-lg border border-border bg-card shadow-card">
            <div className="flex h-10 items-center justify-between border-b border-border px-4 text-xs text-muted-foreground">
              <span className="neon-accent font-heading font-semibold text-accent">READZRAW</span>
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />{stages[active]}</span>
            </div>
            {failed ? <img src={poster.url} alt="Luminous glass cube and floating design panels" className="showcase-media object-cover" /> : (
              <video ref={video} src={preview.url} poster={poster.url} muted playsInline preload="auto" controls={Boolean(reduced)}
                onLoadedMetadata={() => syncVideo(scrollYProgress.get())} onError={() => setFailed(true)}
                className="showcase-media object-contain" aria-label="Animated glass cube and floating design panels" />
            )}
          </motion.div>
        </div>
        <div className="relative mt-8 flex gap-2" role="group" aria-label="Preview stages">
          {stages.map((stage, index) => <Button key={stage} variant={active === index ? "default" : "ghost"} onClick={() => selectStage(index)} aria-pressed={active === index} className="min-w-24">{stage}</Button>)}
        </div>
      </div>
    </section>
  );
}