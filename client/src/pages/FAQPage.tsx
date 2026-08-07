import { useState } from "react";
import { ChevronDown } from "lucide-react";
import NewsletterSection from "@/components/NewsletterSection";

/*
 * Rewritten from copy that was about Kanna the plant. The two entries that
 * only made sense as botany — "raw powder vs extract" and the species-level
 * drug-test answer — are reframed around the product rather than renamed,
 * since a find-and-replace would have left them asserting things about
 * Silly Dots that aren't true of it.
 */
const allFaqs = [
  {
    q: "What Are Silly Dots?",
    a: "Silly Dots are Purple Organics' chewable tablets, built on a blend of functional mushrooms and nootropics. They're formulated to support mood, focus and social ease — a clean, feel-good experience without the crash that comes with stimulants.",
  },
  {
    q: "How Do Silly Dots Make You Feel?",
    a: "Users report an elevated mood, social ease, and mental clarity — feeling more open, positive, and connected, without the negative side effects associated with alcohol or other substances. The experience is smooth, clean, and balanced from start to finish.",
  },
  {
    q: "How Much Should I Take?",
    a: "We recommend starting with the suggested serving size listed on the product label. For Party Tablets, that is typically 2 tablets. For Daily Mood Gummies, start with 1–2 gummies. Do not exceed the recommended serving size. Individual responses vary, so it's best to start low and go slow.",
  },
  {
    q: "Are Silly Dots an Alternative to Alcohol?",
    a: "Many of our customers use Purple Organics products as a social alternative to alcohol — a feel-good, social experience without the calories, hangovers, or next-day regret associated with drinking. It's a clean, plant-powered way to elevate your social experiences.",
  },
  {
    q: "Can I Take Silly Dots Every Day?",
    a: "Daily Mood Gummies are specifically formulated for everyday use at lower doses for consistent mood support and focus. Party Tablets are designed for occasional, higher-energy experiences. We recommend following the suggested use on each product's label and consulting your physician if you have any concerns.",
  },
  {
    q: "Why Extracts Instead of Raw Powder?",
    a: "Raw powder contains whole, unconcentrated plant material, while an extract delivers a more consistent and potent dose of the active compounds. Purple Organics uses premium extracts so that every serving performs the same way as the last.",
  },
  {
    q: "Are There Any Side Effects?",
    a: "When used as directed, most users experience no significant side effects. Some individuals may experience mild nausea, headache, or drowsiness, particularly at higher doses. We recommend starting with the lowest suggested serving and not exceeding the recommended amount.",
  },
  {
    q: "Can I Mix Silly Dots With Caffeine or Alcohol?",
    a: "Purple Organics Party Tablets already contain caffeine and L-Theanine, which work synergistically with the rest of the blend. We do not recommend mixing our products with alcohol or additional stimulants. Always use responsibly and consult your physician if you have any concerns.",
  },
  {
    q: "Are There Any Medications I Cannot Mix With Silly Dots?",
    a: "Our products may interact with certain medications, particularly SSRIs, MAOIs, and other serotonergic drugs. If you are taking any prescription medications, please consult your physician before using Purple Organics products.",
  },
  {
    q: "Do Silly Dots Show Up on a Drug Test?",
    a: "Silly Dots contain no controlled substances and none of their ingredients are included in standard drug screening panels. However, we always recommend consulting your employer or testing provider if you have specific concerns.",
  },
  {
    q: "I Tried Silly Dots and Didn't Feel Anything. Why?",
    a: "Individual responses can vary based on factors such as body weight, metabolism, tolerance, and whether you've eaten recently. If you didn't feel effects on your first try, consider adjusting the timing (taking on an empty stomach may increase absorption) or slightly increasing the serving size within the recommended range.",
  },
  {
    q: "Are Silly Dots Legal?",
    a: "Yes! Silly Dots contain no controlled substances and nothing on any banned substance list. Purple Organics products are manufactured in the USA in cGMP-certified facilities and are compliant with all applicable federal regulations.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border border-border rounded-2xl overflow-hidden transition-all ${open ? "border-[oklch(0.72_0.22_320)]" : "hover:border-white/25"}`}
      style={{ background: "oklch(0.15 0.06 295)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        aria-expanded={open}
      >
        <span className="font-bold text-base text-white">{q}</span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-[oklch(0.72_0.22_320)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-16">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6">
          <h1 className="font-condensed font-black text-5xl md:text-6xl text-white tracking-tight mb-3">
            FAQ
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            Everything you need to know about Purple Organics and Silly Dots.
          </p>
          <div className="space-y-3">
            {allFaqs.map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </main>
      <NewsletterSection />
    </div>
  );
}
