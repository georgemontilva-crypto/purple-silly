import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { oklchAlpha } from "@/lib/color";
import NewsletterSection from "@/components/NewsletterSection";

const C = {
  deep: "oklch(0.09 0.04 295)",
  dark: "oklch(0.13 0.05 295)",
  mid: "oklch(0.20 0.08 295)",
  vivid: "oklch(0.52 0.28 295)",
  pink: "oklch(0.72 0.22 320)",
};

/*
 * These answers describe Silly Dots — the product — not a single botanical
 * ingredient. The previous copy was written about Kanna the plant
 * (Sceletium tortuosum, its native range, its mechanism of action), so
 * swapping the noun alone would have left the site making specific claims
 * about Silly Dots that are simply not true of it. They're rewritten
 * instead, and deliberately stop short of naming a mechanism.
 */
const faqs = [
  {
    q: "What are Silly Dots?",
    a: "Silly Dots are our chewable tablets, built on a blend of functional mushrooms and nootropics. They're formulated to lift your mood and sharpen your focus — a social, feel-good experience without the jitters or crash of stimulants.",
  },
  {
    q: "What are Super Silly Dots?",
    a: "Super Silly Dots are our premium chewable tablets. Each tablet carries a 2400mg blend and comes in 3 delicious flavors: Natural, Blue Razz, and Cherry Berry. Each pack contains 6 servings.",
  },
  {
    q: "How long does it take to feel the effects?",
    a: "Most users begin to feel the effects within 20–45 minutes of taking a Super Silly Dot. Effects typically last 2–4 hours depending on individual metabolism and dosage.",
  },
  {
    q: "Are Silly Dots safe?",
    a: "Our products are lab-tested for purity and potency and are made in the USA. Silly Dots are intended for adults 21+ only. If you take prescription medication — particularly MAOIs, SSRIs, or other serotonergic drugs — talk to a healthcare professional before using them.",
  },
  {
    q: "Can I take Silly Dots every day?",
    a: "They can be used daily, but we recommend cycling usage (e.g., 5 days on, 2 days off) to maintain sensitivity and prevent tolerance buildup. Always start with the lowest effective dose.",
  },
  {
    q: "What flavors are available?",
    a: "Super Silly Dots currently come in three flavors: Natural (original earthy taste), Blue Razz (sweet blue raspberry), and Cherry Berry (bold cherry-berry blend). All three use the same 2400mg formula.",
  },
  {
    q: "Do you ship internationally?",
    a: "We currently ship within the United States. International availability varies by country due to local regulations on functional mushroom supplements. Please check your local laws before ordering.",
  },
];

/**
 * FAQ, with the newsletter signup alongside it.
 *
 * The two used to be stacked full-width sections. Paired here they share
 * one band: questions on the left, signup on the right from lg up, and
 * stacked in that order below it. The header is left-aligned rather than
 * centred now that it heads a column instead of the whole page.
 */
export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24 px-4" style={{ background: C.deep }}>
      <div className="max-w-[1280px] mx-auto grid gap-10 lg:gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div>
          <div className="mb-10">
            <p
              className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ color: C.pink }}
            >
              Got Questions?
            </p>
            <h2 className="text-5xl sm:text-6xl font-extrabold font-condensed text-white">
              FAQ
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background: C.dark,
                  border: `1px solid ${open === i ? oklchAlpha(C.vivid, 60) : C.mid}`,
                }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                >
                  <span className="font-bold text-base text-white leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className="flex-shrink-0 transition-transform duration-200"
                    style={{
                      color: C.pink,
                      transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                {open === i && (
                  <div className="px-6 pb-5">
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "oklch(0.68 0.07 295)" }}
                    >
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/pages/faq"
              className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-80"
              style={{ color: C.pink }}
            >
              View all FAQs →
            </Link>
          </div>
        </div>

        {/* The signup, boxed rather than full-bleed so it can sit in a
            column. Below lg it drops under the questions. */}
        <NewsletterSection variant="panel" />
      </div>
    </section>
  );
}
