import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { oklchAlpha } from "@/lib/color";

const C = {
  deep: "oklch(0.09 0.04 295)",
  dark: "oklch(0.13 0.05 295)",
  mid:  "oklch(0.20 0.08 295)",
  vivid:"oklch(0.52 0.28 295)",
  pink: "oklch(0.72 0.22 320)",
};

const faqs = [
  { q: "What is Kanna?", a: "Kanna (Sceletium tortuosum) is a succulent plant native to South Africa that has been used for centuries by indigenous peoples for its mood-enhancing and stress-relieving properties. It works by interacting with serotonin transporters and PDE4 inhibitors in the brain." },
  { q: "What are Super Silly Dots?", a: "Super Silly Dots are our premium chewable Kanna tablets. Each tablet contains 2400mg of high-quality Kanna extract and comes in 3 delicious flavors: Natural, Blue Razz, and Cherry Berry. Each pack contains 6 servings." },
  { q: "How long does it take to feel the effects?", a: "Most users begin to feel the effects within 20–45 minutes of taking a Super Silly Dot. Effects typically last 2–4 hours depending on individual metabolism and dosage." },
  { q: "Is Kanna safe?", a: "Kanna has a long history of safe use when consumed responsibly. Our products are lab-tested for purity and potency. However, Kanna is intended for adults 21+ only. Do not combine with MAOIs, SSRIs, or other serotonergic substances without consulting a healthcare professional." },
  { q: "Can I take Kanna every day?", a: "While Kanna can be used daily, we recommend cycling usage (e.g., 5 days on, 2 days off) to maintain sensitivity and prevent tolerance buildup. Always start with the lowest effective dose." },
  { q: "What flavors are available?", a: "Super Silly Dots currently come in three flavors: Natural (original earthy Kanna taste), Blue Razz (sweet blue raspberry), and Cherry Berry (bold cherry-berry blend). All flavors contain the same 2400mg Kanna formula." },
  { q: "Do you ship internationally?", a: "We currently ship within the United States. International shipping availability varies by country due to local regulations around Kanna. Please check your local laws before ordering." },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24 px-4" style={{ background: C.deep }}>
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: C.pink }}>Got Questions?</p>
          <h2 className="text-5xl sm:text-6xl font-extrabold font-condensed text-white">FAQ</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{ background: C.dark, border: `1px solid ${open === i ? oklchAlpha(C.vivid, 60) : C.mid}` }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4">
                <span className="font-bold text-base text-white leading-snug">{faq.q}</span>
                <ChevronDown size={18} className="flex-shrink-0 transition-transform duration-200"
                  style={{ color: C.pink, transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm leading-relaxed" style={{ color: "oklch(0.68 0.07 295)" }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/pages/faq" className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-80"
            style={{ color: C.pink }}>
            View all FAQs →
          </Link>
        </div>
      </div>
    </section>
  );
}
