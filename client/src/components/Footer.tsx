import { Link } from "wouter";
import { Facebook, Instagram } from "lucide-react";
import { useSiteAsset } from "@/hooks/useSiteAssets";
import { Reveal } from "@/components/motion/Reveal";

const C = {
  deep: "oklch(0.07 0.03 295)",
  dark: "oklch(0.11 0.05 295)",
  mid: "oklch(0.20 0.08 295)",
  pink: "oklch(0.72 0.22 320)",
};

const COLS = [
  {
    title: "Customer Care",
    links: [
      { label: "FAQ", href: "/pages/faq" },
      { label: "Shipping Information", href: "/policies/shipping-policy" },
      { label: "Refund & Return Policy", href: "/policies/refund-policy" },
      { label: "Product Verification", href: "/product-verification" },
      { label: "Contact Us", href: "/pages/contact" },
      // /pages/lab-reports was never a route — the page lives at the root.
      { label: "Lab Reports", href: "/lab-reports" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Us", href: "/pages/about-us" },
      // href fixed alongside the label: /pages/what-is-kanna was never a
      // route, so this link has been landing on "Page not found".
      { label: "What is Silly?", href: "/what-is-silly" },
      { label: "Blog", href: "/blogs/news" },
      { label: "Loyalty Program", href: "/pages/loyalty" },
      { label: "Do Not Sell My Info", href: "/pages/do-not-sell" },
    ],
  },
  {
    title: "Contact Us",
    links: [
      { label: "support@purple-co.com", href: "mailto:support@purple-co.com" },
      { label: "www.purple-co.com", href: "https://www.purple-co.com" },
      { label: "Privacy Policy", href: "/policies/privacy-policy" },
      { label: "Terms & Conditions", href: "/policies/terms-of-service" },
    ],
  },
];

/**
 * target="_blank" always paired with rel="noopener noreferrer": without
 * noopener the opened tab gets a handle on this window via window.opener
 * and can navigate it somewhere else.
 */
const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/groovypurple/",
    Icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/getgroovypurple",
    Icon: Facebook,
  },
];

export default function Footer() {
  const { asset: logo } = useSiteAsset("logo-footer");
  return (
    <footer style={{ background: C.deep, borderTop: `1px solid ${C.mid}` }}>
      <Reveal className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16">
        <div
          className="flex justify-center sm:justify-start mb-12 pb-10"
          style={{ borderBottom: `1px solid ${C.mid}` }}
        >
          <Link href="/">
            {logo ? (
              <img
                src={logo.url}
                alt="Purple Organics"
                className="h-16 sm:h-10 w-auto object-contain"
              />
            ) : (
              <span
                className="text-3xl sm:text-xl"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  color: "white",
                }}
              >
                PURPLE <span style={{ color: "#a855f7" }}>ORGANICS</span>
              </span>
            )}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-12">
          {COLS.map(col => (
            <div key={col.title}>
              <h4 className="font-extrabold text-sm uppercase tracking-widest mb-5 text-white">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link.label}>
                    {link.href.startsWith("http") ||
                    link.href.startsWith("mailto") ? (
                      <a
                        href={link.href}
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: "oklch(0.58 0.07 295)" }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: "oklch(0.58 0.07 295)" }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          className="flex flex-wrap items-center gap-3 pb-8"
          aria-label="Social media"
        >
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${label} (opens in a new tab)`}
              className="flex items-center justify-center rounded-full transition-colors"
              style={{
                // 44px: the minimum comfortable touch target.
                width: 44,
                height: 44,
                background: C.dark,
                border: `1px solid ${C.mid}`,
                color: "oklch(0.78 0.06 295)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = C.pink;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "oklch(0.78 0.06 295)";
                e.currentTarget.style.borderColor = C.mid;
              }}
            >
              <Icon size={19} aria-hidden="true" />
            </a>
          ))}
        </div>

        <div className="pt-8 border-t space-y-3" style={{ borderColor: C.mid }}>
          <p
            className="text-xs leading-relaxed max-w-3xl"
            style={{ color: "oklch(0.40 0.05 295)" }}
          >
            © {new Date().getFullYear()} Purple Organics. All rights reserved.
            These statements have not been evaluated by the Food and Drug
            Administration. This product is not intended to diagnose, treat,
            cure, or prevent any disease. For adults 21+ only. Keep out of reach
            of children.
          </p>
        </div>
      </Reveal>
    </footer>
  );
}
