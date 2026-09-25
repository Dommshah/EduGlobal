"""Lightweight rule-based AI study-abroad counselor.

Upgrades to an OpenAI-backed response automatically when OPENAI_API_KEY is set,
otherwise returns a helpful rule-based answer grounded in the seeded catalog.
"""
import os
import re
from datetime import datetime, timezone

import httpx
from sqlalchemy.orm import Session

from .models import Country, University

SYSTEM_PROMPT = (
    "You are EduGuide, the friendly AI counselor for Eduglobal, an international study-abroad "
    "consultancy. Answer in a warm, concise, professional tone (max 150 words). Help with "
    "universities, courses, admissions, exams, scholarships, visas, and Eduglobal's process. "
    "Encourage booking a free counseling session. Never invent guaranteed admissions."
)


def _catalog_summary(db: Session) -> str:
    countries = db.query(Country).order_by(Country.order_index).all()
    unis = db.query(University).order_by(University.world_rank).limit(10).all()
    lines = [f"Countries: {', '.join(c.name for c in countries)}."]
    if unis:
        lines.append(
            "Popular universities: "
            + "; ".join(f"{u.name} ({u.city}, rank #{u.world_rank})" for u in unis if u.world_rank)
        )
    return "\n".join(lines)


def _llm_answer(db: Session, message: str, history: list[dict]) -> str | None:
    api_key = os.getenv("OPENAI_API_KEY") or ""
    if not api_key:
        return None
    try:
        resp = httpx.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": "gpt-4o-mini",
                "messages": [{"role": "system", "content": SYSTEM_PROMPT}]
                + history[-8:]
                + [{"role": "user", "content": f"{message}\n\n(Catalog context: {_catalog_summary(db)})"}],
                "max_tokens": 320,
                "temperature": 0.7,
            },
            timeout=20,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()
    except Exception:
        return None


def _rule_answer(db: Session, message: str) -> tuple[str, list[dict]]:
    m = message.lower()
    suggestions: list[dict] = []
    now = datetime.now(timezone.utc)

    def chip(label: str, href: str) -> dict:
        return {"label": label, "href": href}

    if re.search(r"\b(hi|hello|hey|good (morning|afternoon|evening))\b", m):
        return (
            "Hello! 👋 I'm **EduGuide**, your AI study-abroad counselor. I can help you shortlist "
            "universities, compare countries, explain exams like IELTS/GRE, or walk you through "
            "Eduglobal's admission process. What's on your mind?",
            [chip("Explore universities", "/universities"), chip("Book free counseling", "/contact")],
        )

    if "cost" in m or "tuition" in m or "fee" in m or "cheap" in m or "affordable" in m or "budget" in m:
        countries = db.query(Country).order_by(Country.min_tuition).limit(3).all()
        bullets = "\n".join(
            f"• **{c.name}** — from ${c.min_tuition:,}/yr tuition, ~${c.avg_living_cost:,}/mo living"
            for c in countries
        )
        return (
            "Great question! Here are our most budget-friendly destinations:\n\n"
            f"{bullets}\n\nScholarships and assistantships can cut costs further — most of our "
            "partner universities offer merit awards of 15–40%.",
            [chip("Compare all countries", "/countries"), chip("See scholarships guides", "/blog")],
        )

    if "scholarship" in m:
        return (
            "We help you chase three scholarship routes:\n\n"
            "1. **University merit awards** — auto-considered with your application at many partners.\n"
            "2. **Government schemes** — Chevening, DAAD, Australia Awards, Fulbright.\n"
            "3. **Eduglobal fast-track** — our counselors flag you for partner grants up to 40%.\n\n"
            "A strong SOP + early application (8–10 months before intake) massively boosts your odds.",
            [chip("How we help", "/services"), chip("Read success stories", "/testimonials")],
        )

    if "ielts" in m or "toefl" in m or "gre" in m or "gmat" in m or "exam" in m or "test" in m:
        return (
            "Typical requirements:\n\n• **IELTS** 6.0–7.0 (most Masters programs)\n"
            "• **TOEFL** 80–100\n• **GRE** 300+ for competitive US programs\n"
            "• **GMAT** 600+ for top MBAs\n\nMany partners also accept Duolingo or a Medium of "
            "Instruction letter. Take the test 6+ months before your intake so there's room for a retake.",
            [chip("Find courses by intake", "/courses"), chip("Talk to a counselor", "/contact")],
        )

    if "visa" in m:
        return (
            "Our visa team maintains a **94% success rate** across 12,000+ filings. The flow:\n\n"
            "1. Receive your offer → pay tuition deposit\n"
            "2. We prepare your financial documents & SOP for visa\n"
            "3. Mock interview + biometrics slot booking\n"
            "4. Decision in 2–6 weeks depending on country\n\n"
            "We stay with you until your visa is stamped. ✈️",
            [chip("Our process", "/services"), chip("Start your application", "/register")],
        )

    countries = db.query(Country).all()
    matched = [c for c in countries if c.name.lower() in m]
    if matched:
        c = matched[0]
        unis = (
            db.query(University)
            .filter(University.country_id == c.id)
            .order_by(University.world_rank)
            .limit(3)
            .all()
        )
        uni_txt = "\n".join(f"• **{u.name}** — {u.city}" for u in unis)
        return (
            f"**{c.flag} {c.name}** is a brilliant choice! {c.tagline}\n\n"
            f"{uni_txt or 'We partner with its top universities.'}\n\n"
            f"Tuition from ${c.min_tuition:,}/yr · {c.intakes} intakes · {c.visa_success_rate}% visa success.",
            [chip(f"Universities in {c.name}", f"/countries/{c.slug}"), chip("Enquire now", "/enquire")],
        )

    if re.search(r"\b(phd|doctora)\w*", m):
        return (
            "For PhD routes we match you with supervisors first, then craft the research proposal. "
            "Fully-funded positions are common in Germany, Netherlands and Canada (stipend €1,800–2,600/mo). "
            "Share your research area and I'll have a senior counselor reach out within 24 hours.",
            [chip("Explore universities", "/universities"), chip("Enquire now", "/enquire")],
        )

    if "deadline" in m or "intake" in m or "when" in m and "apply" in m:
        return (
            f"Golden rule: apply **8–12 months early**. Upcoming cycles:\n\n"
            f"• **Fall/Sep {now.year + 1}** — deadlines Dec–Mar\n"
            f"• **Spring/Jan {now.year + 2}** — deadlines Jun–Sep\n\n"
            "Popular intakes: Sep (all countries), Jan (UK, Canada, Australia, Germany), May (Canada). "
            "Tell me your target country and I'll map the exact timeline.",
            [chip("Browse courses", "/courses"), chip("Enquire now", "/enquire")],
        )

    if "counsel" in m or "appointment" in m or "talk to" in m or "human" in m or "agent" in m:
        return (
            "Of course! Our senior counselors reply within 24 hours. You can book a free 1:1 session "
            "(in-person or video) — bring your transcripts and dream list, we'll bring the university map. 🌍",
            [chip("Book free session", "/contact"), chip("Enquire now", "/enquire")],
        )

    if "thank" in m:
        return (
            "You're very welcome! 🌟 Whenever you're ready to shortlist universities or check your "
            "eligibility, I'm right here — and our human counselors are one click away.",
            [chip("Explore universities", "/universities"), chip("Book free counseling", "/contact")],
        )

    return (
        "I'd love to help with that! I can advise on **universities, countries, costs, scholarships, "
        "exams, visas and timelines**. Could you share a little more — your study level, field, or a "
        "destination you're dreaming of? Meanwhile, our catalog is a great place to browse.",
        [chip("Explore universities", "/universities"), chip("Enquire now", "/enquire")],
    )


def generate_reply(db: Session, message: str, history: list[dict] | None = None) -> tuple[str, list[dict]]:
    """Return (reply_text, quick_action_suggestions)."""
    history = history or []
    llm = _llm_answer(db, message, history)
    if llm:
        return llm, []
    return _rule_answer(db, message)
