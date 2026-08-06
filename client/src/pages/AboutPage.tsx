import { Link } from "wouter";
import { oklchAlpha } from "@/lib/color";

const C = {
  deep:   "oklch(0.07 0.04 295)",
  dark:   "oklch(0.11 0.05 295)",
  mid:    "oklch(0.20 0.08 295)",
  vivid:  "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
};

const VALUES = [
  {
    icon: "✦",
    title: "Innovation",
    desc: "Continuously exploring and integrating advanced botanical science to create superior mushroom-based products.",
    accent: C.vivid,
  },
  {
    icon: "◈",
    title: "Education",
    desc: "Committing to educate and inspire our community about the benefits and uses of mushrooms in a healthful lifestyle.",
    accent: C.pink,
  },
  {
    icon: "◉",
    title: "Well-being",
    desc: "Promoting physical, mental, and emotional wellness through safe, responsible, and enjoyable products.",
    accent: "oklch(0.60 0.25 185)",
  },
  {
    icon: "◆",
    title: "Quality",
    desc: "Ensuring the highest standards of quality and purity — vegan, gluten-free, and crafted with natural ingredients.",
    accent: "oklch(0.75 0.20 55)",
  },
  {
    icon: "◎",
    title: "Discretion",
    desc: "Respecting the privacy of our customers with discreet, portable, and easy-to-use products.",
    accent: C.bright,
  },
];

export default function AboutPage() {
  return (
    <div style={{ background: C.deep, minHeight: "100vh", color: "white" }}>

      {/* Hero */}
      <div style={{
        padding: "7rem 2rem 5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        borderBottom: `1px solid oklch(0.22 0.08 295)`,
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700, height: 350,
          background: `radial-gradient(ellipse, ${oklchAlpha(C.vivid, 18)} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <span style={{
          display: "inline-block", color: C.pink,
          fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em",
          textTransform: "uppercase", marginBottom: "1rem",
          fontFamily: "'Barlow', sans-serif",
        }}>
          Purple Co · Our Story
        </span>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: "clamp(3rem, 8vw, 6rem)",
          color: "white", lineHeight: 1, margin: "0 0 1.5rem",
        }}>
          About <span style={{ color: C.pink }}>Purple</span>
        </h1>
        <p style={{
          color: "oklch(0.72 0.07 295)", fontSize: "1.1rem",
          maxWidth: 600, margin: "0 auto",
          lineHeight: 1.7,
        }}>
          We're on a mission to illuminate the profound benefits of mushrooms — transforming traditional perceptions and proving that potent effects can be achieved sustainably and safely.
        </p>
      </div>

      {/* Mission + Vision */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        maxWidth: 1280, margin: "0 auto",
        borderBottom: `1px solid oklch(0.22 0.08 295)`,
      }} className="about-grid">
        {/* Mission */}
        <div style={{
          padding: "5rem 4rem",
          borderRight: `1px solid oklch(0.22 0.08 295)`,
          background: C.dark,
        }} className="about-cell">
          <span style={{
            display: "inline-block", color: C.vivid,
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", marginBottom: "1rem",
            fontFamily: "'Barlow', sans-serif",
          }}>
            Our Mission
          </span>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
            color: "white", lineHeight: 1.05, margin: "0 0 1.5rem",
          }}>
            Illuminate the Power of Mushrooms
          </h2>
          <p style={{ color: "oklch(0.72 0.07 295)", lineHeight: 1.75, fontSize: "1rem" }}>
            Purple strives to illuminate the profound benefits of mushrooms, transforming traditional perceptions and demonstrating that potent effects can be achieved sustainably and safely, even without psilocybin. Our mission is to deliver high-quality, vegan, and gluten-free mushroom products that enhance wellness and provide recreational delight.
          </p>
          <p style={{ color: "oklch(0.72 0.07 295)", lineHeight: 1.75, fontSize: "1rem", marginTop: "1rem" }}>
            Through our thoughtfully formulated products, we aim to elevate everyday well-being and open new paths to personal discovery.
          </p>
        </div>
        {/* Vision */}
        <div style={{
          padding: "5rem 4rem",
          background: C.deep,
        }} className="about-cell">
          <span style={{
            display: "inline-block", color: C.pink,
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em",
            textTransform: "uppercase", marginBottom: "1rem",
            fontFamily: "'Barlow', sans-serif",
          }}>
            Our Vision
          </span>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
            color: "white", lineHeight: 1.05, margin: "0 0 1.5rem",
          }}>
            Lead the Mushroom Revolution
          </h2>
          <p style={{ color: "oklch(0.72 0.07 295)", lineHeight: 1.75, fontSize: "1rem" }}>
            Our vision is to be at the forefront of the mushroom revolution, leading with innovation and integrity. We envision a world where the natural power of mushrooms is widely recognized and harnessed for its maximum potential in both wellness and recreational contexts.
          </p>
          <p style={{ color: "oklch(0.72 0.07 295)", lineHeight: 1.75, fontSize: "1rem", marginTop: "1rem" }}>
            We aspire to create a global community where everyone can access the transformative benefits of mushrooms, reshaping the future of natural health and enjoyment.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div style={{
        padding: "6rem 2rem",
        background: C.dark,
        borderBottom: `1px solid oklch(0.22 0.08 295)`,
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span style={{
              display: "inline-block", color: C.vivid,
              fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em",
              textTransform: "uppercase", marginBottom: "0.75rem",
              fontFamily: "'Barlow', sans-serif",
            }}>
              What We Stand For
            </span>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "white", margin: 0,
            }}>
              Core Values
            </h2>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
          }}>
            {VALUES.map((v) => (
              <div
                key={v.title}
                style={{
                  padding: "2rem 1.75rem",
                  borderRadius: "1.25rem",
                  background: oklchAlpha(v.accent, 10),
                  border: `1.5px solid ${oklchAlpha(v.accent, 30)}`,
                  transition: "transform 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.borderColor = oklchAlpha(v.accent, 60);
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.borderColor = oklchAlpha(v.accent, 30);
                }}
              >
                <div style={{
                  fontSize: "1.5rem", color: v.accent,
                  marginBottom: "1rem", fontWeight: 900,
                }}>
                  {v.icon}
                </div>
                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800, fontSize: "1.2rem",
                  color: "white", margin: "0 0 0.6rem",
                }}>
                  {v.title}
                </h3>
                <p style={{
                  color: "oklch(0.68 0.07 295)",
                  fontSize: "0.9rem", lineHeight: 1.65, margin: 0,
                }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Community + CTA */}
      <div style={{
        padding: "6rem 2rem",
        textAlign: "center",
        background: C.deep,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 300,
          background: `radial-gradient(ellipse, ${oklchAlpha(C.pink, 15)} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <span style={{
          display: "inline-block", color: C.pink,
          fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em",
          textTransform: "uppercase", marginBottom: "1rem",
          fontFamily: "'Barlow', sans-serif",
        }}>
          Join the Community
        </span>
        <h2 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)",
          color: "white", margin: "0 0 1rem",
        }}>
          Join Our <span style={{ color: C.pink }}>#GetGroovyPurple</span> Community
        </h2>
        <p style={{
          color: "oklch(0.68 0.07 295)", fontSize: "1rem",
          maxWidth: 500, margin: "0 auto 2.5rem",
          lineHeight: 1.7,
        }}>
          Follow us on Instagram and Facebook for product launches, exclusive content, and community vibes.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
          <a
            href="https://www.instagram.com/groovypurple/"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.875rem 1.75rem", borderRadius: "999px",
              background: oklchAlpha(C.pink, 20), border: `1.5px solid ${oklchAlpha(C.pink, 50)}`,
              color: "white", fontWeight: 700, fontSize: "0.9rem",
              textDecoration: "none", fontFamily: "'Barlow', sans-serif",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = oklchAlpha(C.pink, 35))}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = oklchAlpha(C.pink, 20))}
          >
            Instagram @groovypurple
          </a>
          <a
            href="https://www.facebook.com/getgroovypurple"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.875rem 1.75rem", borderRadius: "999px",
              background: oklchAlpha(C.vivid, 20), border: `1.5px solid ${oklchAlpha(C.vivid, 50)}`,
              color: "white", fontWeight: 700, fontSize: "0.9rem",
              textDecoration: "none", fontFamily: "'Barlow', sans-serif",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = oklchAlpha(C.vivid, 35))}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = oklchAlpha(C.vivid, 20))}
          >
            Facebook @getgroovypurple
          </a>
        </div>
        <Link
          href="/collections/all"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "1rem 2.5rem", borderRadius: "999px",
            background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
            color: "white", fontWeight: 800, fontSize: "1rem",
            textDecoration: "none", fontFamily: "'Barlow', sans-serif",
            boxShadow: `0 8px 32px ${oklchAlpha(C.vivid, 40)}`,
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1.04)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
        >
          Shop All Products →
        </Link>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .about-grid { grid-template-columns: 1fr !important; }
          .about-cell { border-right: none !important; border-bottom: 1px solid oklch(0.22 0.08 295) !important; padding: 3rem 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}
