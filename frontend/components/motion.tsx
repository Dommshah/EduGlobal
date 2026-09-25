"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Reveal — fade+rise into view on scroll                              */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CountUp — animated number when scrolled into view                   */
/* ------------------------------------------------------------------ */
export function CountUp({
  value,
  suffix = "",
  prefix = "",
  duration = 1600,
  className = "",
}: {
  value: number | string;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const target = typeof value === "number" ? value : parseInt(value.replace(/[^\d]/g, ""), 10) || 0;
  const isCurrency = typeof value === "string" && value.startsWith("$");
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !done) {
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            setDisplay(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
            else setDone(true);
          };
          requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, done]);

  const shown = done ? target : display;
  return (
    <span ref={ref} className={className}>
      {isCurrency ? "$" : prefix}
      {shown.toLocaleString()}
      {suffix}
      {isCurrency && /M/.test(String(value)) ? "M" : ""}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Tilt — 3D perspective tilt on hover                                 */
/* ------------------------------------------------------------------ */
export function Tilt({
  children,
  className = "",
  max = 10,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(6px)`;
  }
  function onLeave() {
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee — infinite horizontal scroll (cards keep natural height)    */
/* ------------------------------------------------------------------ */
export function Marquee({
  children,
  speed = 34,
  reverse = false,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={`marquee-fade group/marquee flex overflow-hidden ${className}`}>
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className="flex min-w-full shrink-0 items-stretch justify-around gap-6 group-hover/marquee:[animation-play-state:paused]"
          style={{
            animation: `marquee ${speed}s linear infinite${reverse ? " reverse" : ""}`,
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* QuoteCarousel — rotating inspiration quotes                         */
/* ------------------------------------------------------------------ */
export interface QuoteItem {
  text: string;
  author: string;
}

export function QuoteCarousel({ quotes, interval = 6000 }: { quotes: QuoteItem[]; interval?: number }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (quotes.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % quotes.length), interval);
    return () => clearInterval(t);
  }, [quotes.length, interval]);

  if (!quotes.length) return null;
  const q = quotes[idx];

  return (
    <figure className="mx-auto max-w-3xl text-center">
      <div className="relative min-h-[150px] sm:min-h-[120px]">
        {quotes.map((item, i) => (
          <blockquote
            key={i}
            className={`absolute inset-0 transition-all duration-700 ${i === idx ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
          >
            <p className="font-display text-2xl font-medium leading-snug text-ink-900 sm:text-3xl">
              &ldquo;{item.text}&rdquo;
            </p>
            <figcaption className="mt-4 text-sm font-bold uppercase tracking-[0.15em] text-gold-600">
              — {item.author}
            </figcaption>
          </blockquote>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Quote ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === idx ? "w-7 bg-brand-600" : "w-2 bg-ink-200 hover:bg-ink-300"}`}
          />
        ))}
      </div>
    </figure>
  );
}
