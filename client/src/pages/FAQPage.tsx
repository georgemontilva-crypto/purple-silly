import { useState } from "react";
import { ChevronDown } from "lucide-react";
import AnnouncementBar from "@/components/AnnouncementBar";
import NewsletterSection from "@/components/NewsletterSection";

const allFaqs = [
  { q: "What Is Kanna?", a: "Kanna (Sceletium tortuosum) is a succulent plant native to South Africa that has been used for centuries by indigenous communities for its mood-enhancing and stress-relieving properties. It works primarily by inhibiting serotonin reuptake and PDE4, producing feelings of euphoria, social ease, and mental clarity." },
  { q: "How Does Kanna Make You Feel?", a: "Kanna is known for producing a natural sense of euphoria, elevated mood, social ease, and mental clarity. Users often report feeling more open, positive, and connected — without the negative side effects associated with alcohol or other substances. The experience is smooth, clean, and balanced from start to finish." },
  { q: "How Much Should I Take?", a: "We recommend starting with the suggested serving size listed on the product label. For Party Tablets, that is typically 2 tablets. For Daily Mood Gummies, start with 1–2 gummies. Do not exceed the recommended serving size. Individual responses to kanna vary, so it's best to start low and go slow." },
  { q: "Is Kanna an Alternative to Alcohol?", a: "Many of our customers use Purple Organics products as a social alternative to alcohol. Kanna delivers a feel-good, social experience without the calories, hangovers, or next-day regret associated with drinking. It's a clean, plant-powered way to elevate your social experiences." },
  { q: "Can I Take Kanna Every Day?", a: "Daily Mood Gummies are specifically formulated for everyday use at lower doses for consistent mood support and focus. Party Tablets are designed for occasional, higher-energy experiences. We recommend following the suggested use on each product's label and consulting your physician if you have any concerns." },
  { q: "What Is the Difference Between Raw Kanna Powder and Kanna Extract?", a: "Raw kanna powder contains the whole plant material, while kanna extract is a concentrated form that delivers a more consistent and potent dose of the active alkaloids. Purple Organics uses premium kanna extract to ensure a reliable, high-quality experience in every serving." },
  { q: "Are There Any Side Effects?", a: "When used as directed, most users experience no significant side effects. Some individuals may experience mild nausea, headache, or drowsiness, particularly at higher doses. We recommend starting with the lowest suggested serving and not exceeding the recommended amount." },
  { q: "Can I Mix Kanna With Caffeine or Alcohol?", a: "Purple Organics Party Tablets contain caffeine and L-Theanine, which work synergistically with kanna. We do not recommend mixing our products with alcohol or additional stimulants. Always use responsibly and consult your physician if you have any concerns." },
  { q: "Are There Any Medications I Cannot Mix With Kanna?", a: "Kanna may interact with certain medications, particularly SSRIs, MAOIs, and other serotonergic drugs. If you are taking any prescription medications, please consult your physician before using Purple Organics products." },
  { q: "Does Kanna Show Up on a Drug Test?", a: "Kanna (Sceletium tortuosum) is not a controlled substance and is not included in standard drug screening panels. However, we always recommend consulting your employer or testing provider if you have specific concerns." },
  { q: "I Tried Kanna and Didn't Feel Anything. Why?", a: "Individual responses to kanna can vary based on factors such as body weight, metabolism, tolerance, and whether you've eaten recently. If you didn't feel effects on your first try, consider adjusting the timing (taking on an empty stomach may increase absorption) or slightly increasing the serving size within the recommended range." },
  { q: "Is Kanna Legal?", a: "Yes! Kanna (Sceletium tortuosum) is federally legal in the United States and most countries worldwide. It is not a controlled substance and is not on any banned substance list. Purple Organics products are manufactured in the USA in cGMP-certified facilities and are compliant with all applicable federal regulations." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-gray-200 rounded-2xl overflow-hidden transition-all ${open ? "border-[oklch(0.62_0.25_340)]" : "hover:border-gray-300"}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-5 text-left" aria-expanded={open}>
        <span className="font-bold text-base text-[oklch(0.22_0.08_265)]">{q}</span>
        <ChevronDown size={18} className={`flex-shrink-0 text-[oklch(0.62_0.25_340)] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{a}</div>}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <main className="flex-1 py-16">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6">
          <h1 className="font-condensed font-black text-5xl md:text-6xl text-[oklch(0.22_0.08_265)] tracking-tight mb-3">
            FAQ
          </h1>
          <p className="text-gray-500 text-lg mb-10">Everything you need to know about Purple Organics and Kanna.</p>
          <div className="space-y-3">
            {allFaqs.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
          </div>
        </div>
      </main>
      <NewsletterSection />
    </div>
  );
}

