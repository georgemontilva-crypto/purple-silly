import { Link } from "wouter";
import { useSiteAsset } from "@/hooks/useSiteAssets";

const C = {
  deep: "oklch(0.07 0.03 295)",
  dark: "oklch(0.11 0.05 295)",
  mid:  "oklch(0.20 0.08 295)",
  pink: "oklch(0.72 0.22 320)",
};

const COLS = [
  { title: "Customer Care", links: [
    { label: "FAQ", href: "/pages/faq" },
    { label: "Shipping Information", href: "/pages/shipping-information" },
    { label: "Refund & Return Policy", href: "/pages/refund-return-policy" },
    { label: "Contact Us", href: "/pages/contact" },
    { label: "Lab Reports", href: "/pages/lab-reports" },
  ]},
  { title: "About", links: [
    { label: "About Us", href: "/pages/about-us" },
    { label: "What is Kanna?", href: "/pages/what-is-kanna" },
    { label: "Blog", href: "/blogs/news" },
    { label: "Loyalty Program", href: "/pages/loyalty" },
    { label: "Do Not Sell My Info", href: "/pages/do-not-sell" },
  ]},
  { title: "Contact Us", links: [
    { label: "support@purple-co.com", href: "mailto:support@purple-co.com" },
    { label: "www.purple-co.com", href: "https://www.purple-co.com" },
    { label: "Privacy Policy", href: "/pages/privacy-policy" },
    { label: "Terms & Conditions", href: "/pages/terms-and-conditions" },
  ]},
];

export default function Footer() {
  const { asset: logo } = useSiteAsset("logo-footer");
  return (
    <footer style={{ background: C.deep, borderTop: `1px solid ${C.mid}` }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 pb-10"
          style={{ borderBottom: `1px solid ${C.mid}` }}>
          <Link href="/">
            {logo ? (
              <img src={logo.url} alt="Purple Organics" className="h-10 w-auto object-contain" />
            ) : (
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.2rem", color: "white" }}>
                PURPLE <span style={{ color: "#a855f7" }}>ORGANICS</span>
              </span>
            )}
          </Link>
          <div className="flex items-center gap-3">
            {[
              { label: "Instagram", href: "https://instagram.com/purpleorganics", icon: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
              { label: "TikTok", href: "https://tiktok.com/@purpleorganics", icon: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg> },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all hover:bg-white/10"
                style={{ border: `1px solid ${C.mid}` }} aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-12">
          {COLS.map(col => (
            <div key={col.title}>
              <h4 className="font-extrabold text-sm uppercase tracking-widest mb-5 text-white">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link.label}>
                    {link.href.startsWith("http") || link.href.startsWith("mailto") ? (
                      <a href={link.href} className="text-sm transition-colors hover:text-white" style={{ color: "oklch(0.58 0.07 295)" }}>{link.label}</a>
                    ) : (
                      <Link href={link.href} className="text-sm transition-colors hover:text-white" style={{ color: "oklch(0.58 0.07 295)" }}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t space-y-3" style={{ borderColor: C.mid }}>
          <p className="text-xs leading-relaxed max-w-3xl" style={{ color: "oklch(0.40 0.05 295)" }}>
            © {new Date().getFullYear()} Purple Organics. All rights reserved. These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease. For adults 21+ only. Keep out of reach of children.
          </p>
        </div>
      </div>
    </footer>
  );
}
