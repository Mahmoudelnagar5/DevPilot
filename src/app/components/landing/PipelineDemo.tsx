import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "motion/react";
import {
  FileText, Boxes, GitBranch, DollarSign, CalendarClock, ShieldAlert,
} from "lucide-react";

const IDEA_TEXT =
  "I want an app where people can book home cleaning services and pay online.";

const OUTPUTS = [
  { icon: FileText, label: "Requirements", detail: "18 functional, 6 non-functional" },
  { icon: Boxes, label: "Architecture", detail: "Modular monolith, 4 services" },
  { icon: GitBranch, label: "ER Diagram", detail: "9 core entities mapped" },
  { icon: DollarSign, label: "Cost estimate", detail: "$14,200 – $19,800" },
  { icon: CalendarClock, label: "Timeline", detail: "9 weeks, 5 sprints" },
  { icon: ShieldAlert, label: "Risk report", detail: "Low risk · 2 flags" },
];

/**
 * The hero's signature element: a live demonstration of DevPilot's core
 * mechanism — a plain-language idea going in, a structured, costed plan
 * coming out. Plays once when it scrolls into view; respects reduced motion.
 */
export function PipelineDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();

  const [typedChars, setTypedChars] = useState(prefersReducedMotion ? IDEA_TEXT.length : 0);
  const [pulseActive, setPulseActive] = useState(false);

  useEffect(() => {
    if (!inView || prefersReducedMotion) return;
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setTypedChars(i);
      if (i >= IDEA_TEXT.length) {
        clearInterval(interval);
        setTimeout(() => setPulseActive(true), 250);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [inView, prefersReducedMotion]);

  useEffect(() => {
    if (inView && prefersReducedMotion) setPulseActive(true);
  }, [inView, prefersReducedMotion]);

  const showOutputs = prefersReducedMotion ? inView : pulseActive;

  return (
    <div
      ref={ref}
      className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1.3fr] items-center gap-6 lg:gap-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 lg:p-8"
    >
      {/* Idea input */}
      <div className="rounded-xl border border-border bg-background/80 p-4 font-mono text-sm text-foreground/90 min-h-[110px]">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-destructive/70" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-success/70" />
          <span className="ml-2 text-xs text-muted-foreground">client-intake.txt</span>
        </div>
        <p className="leading-relaxed">
          {IDEA_TEXT.slice(0, typedChars)}
          {typedChars < IDEA_TEXT.length && (
            <span className="inline-block w-[7px] h-[1em] -mb-[2px] bg-primary animate-pulse ml-0.5" />
          )}
        </p>
      </div>

      {/* Connector / AI node */}
      <div className="flex lg:flex-col items-center justify-center gap-2 py-2 lg:py-0">
        <div className="hidden lg:block w-px h-10 bg-gradient-to-b from-transparent to-primary/60" />
        <motion.div
          className="relative flex items-center justify-center size-14 rounded-full border border-primary/40 bg-primary/10"
          animate={
            pulseActive && !prefersReducedMotion
              ? { boxShadow: ["0 0 0 0 rgba(45,212,191,0.35)", "0 0 0 14px rgba(45,212,191,0)"] }
              : {}
          }
          transition={{ duration: 1.4, repeat: pulseActive ? 2 : 0, ease: "easeOut" }}
        >
          <span className="font-display text-xs font-semibold tracking-wide text-primary">AI</span>
        </motion.div>
        <div className="hidden lg:block w-px h-10 bg-gradient-to-b from-primary/60 to-transparent" />
        <div className="rotate-90 lg:rotate-0 text-muted-foreground text-lg leading-none lg:hidden">→</div>
      </div>

      {/* Structured outputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {OUTPUTS.map((output, i) => {
          const Icon = output.icon;
          return (
            <motion.div
              key={output.label}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={
                showOutputs
                  ? { opacity: 1, y: 0 }
                  : prefersReducedMotion
                  ? {}
                  : { opacity: 0, y: 10 }
              }
              transition={{ duration: 0.35, delay: prefersReducedMotion ? 0 : 0.15 + i * 0.12 }}
              className="rounded-lg border border-border bg-background/60 p-3"
            >
              <Icon className="size-4 text-primary mb-2" strokeWidth={1.75} />
              <p className="text-xs font-medium text-foreground">{output.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{output.detail}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
