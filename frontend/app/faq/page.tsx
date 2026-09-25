"use client";

import { useState } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/cards";

const FAQS: { category: string; q: string; a: string }[] = [
  {
    category: "General",
    q: "What does EduGlobal actually do?",
    a: "We are a full-service international education consultancy. From shortlisting universities and courses, to applications, scholarships, visas, accommodation and pre-departure briefings — one dedicated counselor walks with you from your first enquiry to your first day on campus.",
  },
  {
    category: "General",
    q: "Is counselling really free?",
    a: "Yes. Your first counselling session, profile evaluation and shortlist are completely free. We earn from partner-university commissions, so students never pay us for advice — you only pay university application or service fees where the university itself charges them.",
  },
  {
    category: "Applications",
    q: "When should I start my application?",
    a: "Ideally 10–12 months before your intended intake. Competitive programs in the USA, UK and Canada fill early. For fall (Sept) intakes, begin by the previous September; for spring (Jan) intakes, begin around March.",
  },
  {
    category: "Applications",
    q: "Can I apply without IELTS/TOEFL?",
    a: "Many partner universities accept alternatives like Duolingo, PTE, internal English tests, or a MOI (Medium of Instruction) letter. Our AI counselor and your counselor can filter universities that match your exact profile — try the AI Counselor chat.",
  },
  {
    category: "Applications",
    q: "How many universities can I apply to?",
    a: "We recommend 5–8 targets: 2 ambitious, 3 moderate and 2 safe choices. Your counselor builds a balanced shortlist based on your academics, budget and career goals.",
  },
  {
    category: "Finance",
    q: "How much does studying abroad cost?",
    a: "It varies widely: ₹15–25L/year for the UK and Australia, ₹20–45L/year for the USA, €10–20K/year for Germany (public universities are nearly tuition-free). Check each destination page for verified tuition and living-cost ranges.",
  },
  {
    category: "Finance",
    q: "Can EduGlobal help with scholarships?",
    a: "Yes — we maintain a live scholarship database and every application you file through us is automatically considered for partner-university merit awards. In 2025 our students won ₹40Cr+ in cumulative scholarships.",
  },
  {
    category: "Finance",
    q: "Do you help with education loans?",
    a: "We partner with leading NBFCs and banks for collateral-free loans up to ₹75L. Loan pre-approval usually takes 5–7 working days once your offer letter arrives.",
  },
  {
    category: "Visas",
    q: "What is your visa success rate?",
    a: "98.2% across all destinations in 2025. Every visa file is reviewed twice — once by your counselor and once by our visa specialists — before submission, with a full mock interview for the USA and Canada.",
  },
  {
    category: "Visas",
    q: "What documents do I need for a student visa?",
    a: "Typically: valid passport, offer letter, financial proof (28-day bank history for the UK, GIC for Canada), academic transcripts, English test scores, medicals and tuition-payment receipts. Your dashboard shows a live document checklist for your specific country.",
  },
  {
    category: "Life Abroad",
    q: "Do you help with accommodation and flights?",
    a: "Yes. Our pre-departure desk arranges verified student housing, airport pickup, SIM cards and forex cards. Accommodation is usually confirmed 4–6 weeks before your intake.",
  },
  {
    category: "Life Abroad",
    q: "Can I work while studying?",
    a: "Most destinations allow 20 hours/week during term and full-time in breaks: 20h in the UK & Australia (48h/fortnight), 20h in the USA on-campus, 24h/week in Canada as of 2025. Germany allows 120 full days per year.",
  },
];

const CATEGORIES = ["All", ...Array.from(new Set(FAQS.map((f) => f.category)))];

export default function FAQPage() {
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(0);
  const visible = FAQS.filter((f) => cat === "All" || f.category === cat);

  return (
    <main className="section-pad">
      <SectionHeading
        eyebrow="Help Center"
        title="Frequently asked questions"
        sub="Everything students ask us before, during and after their journey. Still unsure? Our AI counselor answers 24/7."
      />

      <div className="mx-auto mt-10 max-w-4xl">
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCat(c);
                setOpen(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                cat === c
                  ? "bg-gradient-to-r from-brand-600 to-brand-800 text-white shadow-3d"
                  : "glass text-ink-900/70 hover:text-brand-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          {visible.map((f, i) => (
            <div
              key={f.q}
              className={`glass overflow-hidden rounded-2xl transition-all ${open === i ? "shadow-luxe ring-1 ring-brand-200" : ""}`}
            >
              <button
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-ink-900">{f.q}</span>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform ${
                    open === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ${
                  open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-sm leading-relaxed text-ink-900/65">{f.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-dark relative mt-14 overflow-hidden rounded-3xl p-8 text-center sm:p-12">
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,#6366f1,transparent_50%),radial-gradient(circle_at_80%_80%,#d97706,transparent_50%)]" />
          <div className="relative">
            <h3 className="font-display text-2xl font-bold text-white">Didn&apos;t find your answer?</h3>
            <p className="mx-auto mt-2 max-w-md text-white/70">
              Ask EduGuide, our AI counselor — instant answers about universities, visas, costs and deadlines.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/chat" className="btn-3d !px-6 !py-3">
                Ask the AI Counselor
              </Link>
              <Link
                href="/support"
                className="rounded-xl border border-white/25 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
