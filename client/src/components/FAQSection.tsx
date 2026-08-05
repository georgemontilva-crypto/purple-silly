import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "wouter";

const faqs = [
  {
    q: "Is Kanna Legal?",
    a: "Yes! Kanna (Sceletium tortuosum) is federally legal in the United States and most countries worldwide. It is not a controlled substance and is not on any banned substance list. Ferris Wheel products are manufactured in the USA in cGMP-certified facilities and are compliant with all applicable federal regulations.",
  },
  {
    q: "Is Kanna Safe?",
    a: "Kanna has been used safely for centuries by indigenous communities in South Africa. Modern research supports its safety profile when used responsibly by healthy adults. All Ferris Wheel products are third-party lab tested for purity and potency. As with any supplement, consult your physician before use if you have a medical condition or take prescription medications.",
  },
  {
    q: "How Does Kanna Make You Feel?",
    a: "Kanna is known for producing a natural sense of euphoria, elevated mood, social ease, and mental clarity. Users often report feeling more open, positive, and connected — without the negative side effects associated with alcohol or other substances. The experience is smooth, clean, and balanced from start to finish.",
  },
  {
    q: "How Long Do the Effects Last?",
    a: "The effects of Ferris Wheel products typically last between 2 to 4 hours, depending on individual factors such as body weight, metabolism, and tolerance. Most users experience a gradual onset within 20–45 minutes, a peak period, and a smooth, gentle landing with no crash.",
  },
  {
    q: "How Long Does It Take Ferris Wheel Tablets to Work?",
    a: "Most users begin to feel the effects within 20 to 45 minutes of taking Ferris Wheel Party Tablets. Factors such as whether you've eaten recently, your body weight, and individual metabolism can affect onset time. We recommend starting with the suggested serving size and waiting at least 60 minutes before considering an additional serving.",
  },
  {
    q: "How Much Should I Take?",
    a: "We recommend starting with the suggested serving size listed on the product label. For Party Tablets, that is typically 2 tablets. For Daily Mood Gummies, start with 1–2 gummies. Do not exceed the recommended serving size. Individual responses to kanna vary, so it's best to start low and go slow.",
  },
  {
    q: "When Should I Take Them?",
    a: "Party Tablets are designed for social situations, nights out, events, or any time you want a higher-energy, more immersive experience. Daily Mood Gummies are formulated for everyday use — take them in the morning or afternoon for balanced mood support, social ease, and focus throughout the day.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200 ${open ? "border-[oklch(0.62_0.25_340)]" : "hover:border-gray-300"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        aria-expanded={open}>
        <span className="font-bold text-base text-[oklch(0.22_0.08_265)]">{q}</span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-[oklch(0.62_0.25_340)] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[860px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-condensed font-black text-4xl md:text-5xl text-[oklch(0.22_0.08_265)] tracking-tight mb-2">
            Got Questions?
          </h2>
          <p className="text-gray-500 text-base">
            Everything you need to know about Ferris Wheel and Kanna.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <FAQItem key={q} q={q} a={a} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/pages/faq"
            className="inline-flex items-center gap-2 text-sm font-bold text-[oklch(0.62_0.25_340)] hover:text-[oklch(0.22_0.08_265)] transition-colors">
            View all FAQs →
          </Link>
        </div>
      </div>
    </section>
  );
}

