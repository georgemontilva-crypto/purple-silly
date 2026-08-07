import { useEffect, useRef, useState } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { AmbientGlow } from "@/components/motion/AmbientGlow";
import "./ProductVerification.css";

export const VERIFICATION_URL =
  "https://verification.marketinging.agency/purple/";

/**
 * Product verification, embedded in our own page.
 *
 * The verifier is a third-party site. Checked before building this: it
 * sends no X-Frame-Options and its CSP carries no frame-ancestors, and it
 * genuinely renders inside a frame — the iframe fires `load` and leaves
 * about:blank. So the embed is the primary path.
 *
 * It is still someone else's server, though, and a header can be added on
 * their side any day without warning. Two things guard against that: the
 * "open in a new tab" link is always visible rather than being a hidden
 * fallback, and if `load` hasn't fired within a few seconds the page says
 * so and points at the same link. A blank grey rectangle with no
 * explanation is the failure worth designing against.
 */
const LOAD_TIMEOUT_MS = 8000;

export default function ProductVerification() {
  const [state, setState] = useState<"loading" | "ready" | "blocked">(
    "loading"
  );
  const timer = useRef<number | null>(null);

  useEffect(() => {
    timer.current = window.setTimeout(() => {
      setState(s => (s === "loading" ? "blocked" : s));
    }, LOAD_TIMEOUT_MS);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="verify-page ambient-glow-host">
      <AmbientGlow variant="a" />

      <main className="verify-page__inner">
        <header className="verify-page__head">
          <p className="verify-page__eyebrow">
            <ShieldCheck size={14} aria-hidden="true" /> Authenticity
          </p>
          <h1 className="verify-page__title">Product Verification</h1>
          <p className="verify-page__lede">
            Check the code on your pack to confirm it came from us. Enter it
            below and the verifier will tell you straight away.
          </p>
          <a
            className="verify-page__external"
            href={VERIFICATION_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open the verifier in a new tab
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </header>

        {state === "blocked" ? (
          <div className="verify-fallback" role="status">
            <ShieldCheck size={30} aria-hidden="true" />
            <p className="verify-fallback__title">
              The verifier didn't load in this page
            </p>
            <p className="verify-fallback__body">
              It's hosted on a separate site, which may be blocking embedded
              use. It works normally on its own.
            </p>
            <a
              className="verify-fallback__cta"
              href={VERIFICATION_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Product Verification
              <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        ) : (
          <div className="verify-frame">
            <iframe
              className="verify-frame__iframe"
              src={VERIFICATION_URL}
              title="Purple Organics product verification"
              onLoad={() => setState("ready")}
              /* Only what a verification form needs. Notably no
                 allow-top-navigation: a third-party frame must not be able
                 to redirect the page it's embedded in. */
              sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
              referrerPolicy="no-referrer-when-downgrade"
              loading="lazy"
            />
          </div>
        )}
      </main>
    </div>
  );
}
