import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { oklchAlpha } from "@/lib/color";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/Reveal";

const C = {
  deep:   "oklch(0.07 0.04 295)",
  dark:   "oklch(0.10 0.05 295)",
  border: "oklch(0.18 0.06 295)",
  vivid:  "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
  text:   "oklch(0.92 0.02 295)",
  muted:  "oklch(0.55 0.07 295)",
};

export default function LabReportsPage() {
  const [activeCat, setActiveCat] = useState<number | undefined>(undefined);
  const { data: categories } = trpc.admin.categories.list.useQuery();
  const { data: reports, isLoading } = trpc.admin.labReports.list.useQuery({
    categoryId: activeCat,
    publishedOnly: true,
  });

  const getCatName = (id: number) => categories?.find(c => c.id === id)?.name ?? "Unknown";

  return (
    <div style={{ background: C.deep, minHeight: "100vh", color: C.text }}>

      {/* Hero */}
      <Reveal style={{
        padding: "6rem 2rem 4rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 300,
          background: `radial-gradient(ellipse, ${oklchAlpha(C.vivid, 18)} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <span style={{
          display: "inline-block", color: C.pink,
          fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em",
          textTransform: "uppercase", marginBottom: "1rem",
          fontFamily: "'Barlow', sans-serif",
        }}>
          Transparency & Quality
        </span>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          color: "white", lineHeight: 1, margin: "0 0 1rem",
        }}>
          Lab <span style={{ color: C.pink }}>Reports</span>
        </h1>
        <p style={{
          color: C.muted, fontSize: "1rem",
          maxWidth: 520, margin: "0 auto",
          lineHeight: 1.7,
        }}>
          Every Purple Co product is third-party tested for purity, potency, and safety. Download our Certificates of Analysis below.
        </p>
      </Reveal>

      {/* Category filters */}
      <Reveal style={{
        padding: "2rem",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        gap: "0.75rem",
        flexWrap: "wrap",
        justifyContent: "center",
        background: C.dark,
      }}>
        <button
          onClick={() => setActiveCat(undefined)}
          style={{
            padding: "0.5rem 1.25rem", borderRadius: "999px",
            border: `1.5px solid ${activeCat === undefined ? C.vivid : C.border}`,
            background: activeCat === undefined ? oklchAlpha(C.vivid, 20) : "transparent",
            color: activeCat === undefined ? C.vivid : C.muted,
            fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
            transition: "all 0.15s",
            fontFamily: "'Barlow', sans-serif",
          }}
        >
          All Products
        </button>
        {categories?.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            style={{
              padding: "0.5rem 1.25rem", borderRadius: "999px",
              border: `1.5px solid ${activeCat === cat.id ? C.vivid : C.border}`,
              background: activeCat === cat.id ? oklchAlpha(C.vivid, 20) : "transparent",
              color: activeCat === cat.id ? C.vivid : C.muted,
              fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            {cat.name}
          </button>
        ))}
      </Reveal>

      {/* Reports grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 2rem" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: C.muted }}>
            Loading lab reports...
          </div>
        ) : !reports || reports.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "5rem 2rem",
            border: `1px dashed ${C.border}`,
            borderRadius: "1.5rem",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔬</div>
            <h3 style={{ color: C.text, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.5rem", margin: "0 0 0.5rem" }}>
              No reports available yet
            </h3>
            <p style={{ color: C.muted, margin: 0 }}>
              Lab reports will appear here once they are published.
            </p>
          </div>
        ) : (
          <RevealStagger style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}>
            {reports.map(report => (
              <RevealItem key={report.id}>
              <div
                style={{
                  background: oklchAlpha(C.vivid, 8),
                  border: `1.5px solid ${C.border}`,
                  borderRadius: "1.25rem",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = oklchAlpha(C.vivid, 50);
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = C.border;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                {/* PDF icon */}
                <div style={{
                  width: 48, height: 48,
                  background: oklchAlpha(C.pink, 20),
                  border: `1px solid ${oklchAlpha(C.pink, 35)}`,
                  borderRadius: "0.75rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem",
                }}>
                  📄
                </div>

                {/* Category badge */}
                <span style={{
                  display: "inline-block",
                  padding: "0.2rem 0.65rem", borderRadius: "999px",
                  background: oklchAlpha(C.vivid, 18), border: `1px solid ${oklchAlpha(C.vivid, 30)}`,
                  color: C.vivid, fontSize: "0.7rem", fontWeight: 700,
                  letterSpacing: "0.05em", textTransform: "uppercase",
                  alignSelf: "flex-start",
                }}>
                  {getCatName(report.categoryId)}
                </span>

                {/* Title */}
                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800, fontSize: "1.15rem",
                  color: C.text, margin: 0, lineHeight: 1.2,
                }}>
                  {report.title}
                </h3>

                {/* Meta */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {report.productName && (
                    <div style={{ color: C.muted, fontSize: "0.82rem" }}>
                      <span style={{ color: C.text, fontWeight: 600 }}>Product:</span> {report.productName}
                    </div>
                  )}
                  {report.batchNumber && (
                    <div style={{ color: C.muted, fontSize: "0.82rem" }}>
                      <span style={{ color: C.text, fontWeight: 600 }}>Batch:</span> {report.batchNumber}
                    </div>
                  )}
                  {report.testDate && (
                    <div style={{ color: C.muted, fontSize: "0.82rem" }}>
                      <span style={{ color: C.text, fontWeight: 600 }}>Test Date:</span> {report.testDate}
                    </div>
                  )}
                </div>

                {/* Download button */}
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.65rem 1.25rem", borderRadius: "0.6rem",
                    background: `linear-gradient(135deg, ${C.bright}, ${C.pink})`,
                    color: "white", fontWeight: 700, fontSize: "0.875rem",
                    textDecoration: "none",
                    marginTop: "auto",
                    alignSelf: "flex-start",
                    boxShadow: `0 4px 16px ${oklchAlpha(C.vivid, 25)}`,
                    transition: "transform 0.15s",
                    fontFamily: "'Barlow', sans-serif",
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = "scale(1.03)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
                >
                  ↓ Download PDF
                </a>
              </div>
              </RevealItem>
            ))}
          </RevealStagger>
        )}
      </div>
    </div>
  );
}
