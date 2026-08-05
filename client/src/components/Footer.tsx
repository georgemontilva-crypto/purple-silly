import { Link } from "wouter";
import { Instagram } from "lucide-react";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.13_0.04_265)] text-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16">
        {/* Logo + Social */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
          <div>
            <div className="bg-white text-[oklch(0.22_0.08_265)] px-4 py-2 rounded-xl font-condensed font-black text-2xl tracking-tight leading-none inline-block mb-4">
              FERRIS<br />WHEEL
            </div>
            <div className="flex gap-3 mt-4">
              <a href="https://www.instagram.com/getferriswheel/" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[oklch(0.62_0.25_340)] transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://www.tiktok.com/@getferriswheel" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[oklch(0.62_0.25_340)] transition-colors">
                <TikTokIcon />
              </a>
            </div>
          </div>

          {/* 3 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 flex-1 max-w-2xl">
            {/* Customer Care */}
            <div>
              <h4 className="font-extrabold text-sm tracking-widest uppercase text-[oklch(0.92_0.18_95)] mb-4">
                Customer Care
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Shipping Information", href: "/pages/shipping-information" },
                  { label: "Refund & Return Policy", href: "/pages/refund-return-policy" },
                  { label: "Privacy Policy", href: "/pages/privacy-policy" },
                  { label: "Terms and Conditions", href: "/pages/terms-and-conditions" },
                  { label: "Do Not Sell My Personal Information", href: "/pages/do-not-sell" },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-white/70 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="font-extrabold text-sm tracking-widest uppercase text-[oklch(0.92_0.18_95)] mb-4">
                About
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "About Us", href: "/pages/about-us" },
                  { label: "Blog", href: "/blogs/news" },
                  { label: "FAQ", href: "/pages/faq" },
                  { label: "Help Center", href: "http://help.getferriswheel.com/" },
                  { label: "Get In Touch", href: "/pages/contact" },
                  { label: "Lab Reports", href: "/pages/lab-reports" },
                  { label: "Rewards", href: "/pages/loyalty" },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-white/70 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="font-extrabold text-sm tracking-widest uppercase text-[oklch(0.92_0.18_95)] mb-4">
                Contact Us
              </h4>
              <address className="not-italic text-sm text-white/70 space-y-1 leading-relaxed">
                <p className="font-bold text-white">Ferris Wheel</p>
                <p>5101 Tampa West Blvd</p>
                <p>Suite 200</p>
                <p>Tampa, FL 33634</p>
                <a href="tel:+18555526874" className="block mt-3 hover:text-white transition-colors">
                  (855) 552-6874
                </a>
                <a href="mailto:info@getferriswheel.com" className="hover:text-white transition-colors">
                  info@getferriswheel.com
                </a>
              </address>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-white/10 pt-8 space-y-4">
          <p className="text-xs text-white/40 leading-relaxed max-w-4xl">
            These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease or medical condition. Ferris Wheel products are dietary supplements intended for use by healthy adults. Consult your physician before use if you are pregnant, nursing, taking prescription medications, or a known medical condition. Individual results may vary. Keep out of reach of children. Must be 21+ to purchase. Ferris Wheel is owned and operated by FW Wellness, Inc.
          </p>
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Ferris Wheel</p>
        </div>
      </div>
    </footer>
  );
}
