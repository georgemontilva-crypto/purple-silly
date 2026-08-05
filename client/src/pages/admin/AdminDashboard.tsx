import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import AdminUsers from "./AdminUsers";
import AdminLabReports from "./AdminLabReports";
import AdminCategories from "./AdminCategories";
import AdminProducts from "./AdminProducts";

const C = {
  bg:     "oklch(0.07 0.04 295)",
  sidebar:"oklch(0.10 0.05 295)",
  border: "oklch(0.18 0.06 295)",
  vivid:  "oklch(0.52 0.28 295)",
  bright: "oklch(0.62 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
  text:   "oklch(0.92 0.02 295)",
  muted:  "oklch(0.55 0.07 295)",
};

type AdminTab = "overview" | "products" | "categories" | "users" | "lab-reports";

const NAV_ITEMS: { id: AdminTab; label: string; icon: string }[] = [
  { id: "overview",    label: "Overview",     icon: "◈" },
  { id: "products",    label: "Products",     icon: "◉" },
  { id: "categories",  label: "Categories",   icon: "◆" },
  { id: "lab-reports", label: "Lab Reports",  icon: "◎" },
  { id: "users",       label: "Users",        icon: "✦" },
];

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div style={{
      background: `${accent}12`,
      border: `1.5px solid ${accent}30`,
      borderRadius: "1rem",
      padding: "1.5rem",
      flex: "1 1 160px",
      minWidth: 0,
    }}>
      <div style={{ color: accent, fontSize: "2rem", fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ color: C.muted, fontSize: "0.8rem", marginTop: "0.4rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

function Overview() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();
  const { data: categories } = trpc.admin.categories.list.useQuery();
  const { data: reports } = trpc.admin.labReports.listAdmin.useQuery();

  return (
    <div>
      <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2rem", color: C.text, margin: "0 0 1.5rem" }}>
        Dashboard Overview
      </h2>
      {/* Stats row */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <StatCard label="Total Users" value={isLoading ? "—" : stats?.users ?? 0} accent={C.vivid} />
        <StatCard label="Lab Reports" value={isLoading ? "—" : stats?.labReports ?? 0} accent={C.pink} />
        <StatCard label="Categories" value={isLoading ? "—" : stats?.categories ?? 0} accent="oklch(0.60 0.25 185)" />
      </div>

      {/* Recent Lab Reports */}
      <div style={{
        background: `${C.vivid}08`,
        border: `1px solid ${C.border}`,
        borderRadius: "1rem",
        padding: "1.5rem",
        marginBottom: "1.5rem",
      }}>
        <h3 style={{ color: C.text, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 1rem" }}>
          Recent Lab Reports
        </h3>
        {!reports || reports.length === 0 ? (
          <p style={{ color: C.muted, fontSize: "0.9rem" }}>No lab reports yet. Upload your first report in the Lab Reports tab.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {reports.slice(0, 5).map(r => (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.75rem 1rem",
                background: `${C.vivid}08`,
                borderRadius: "0.5rem",
                border: `1px solid ${C.border}`,
              }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 600, fontSize: "0.9rem" }}>{r.title}</div>
                  <div style={{ color: C.muted, fontSize: "0.75rem" }}>{r.productName} · {r.testDate}</div>
                </div>
                <span style={{
                  padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
                  background: r.isPublished ? `${C.vivid}25` : `${C.pink}25`,
                  color: r.isPublished ? C.vivid : C.pink,
                }}>
                  {r.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Categories summary */}
      <div style={{
        background: `${C.pink}08`,
        border: `1px solid ${C.border}`,
        borderRadius: "1rem",
        padding: "1.5rem",
      }}>
        <h3 style={{ color: C.text, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.1rem", margin: "0 0 1rem" }}>
          Report Categories
        </h3>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {categories?.map(cat => (
            <span key={cat.id} style={{
              padding: "0.4rem 1rem", borderRadius: "999px",
              background: `${C.pink}18`, border: `1px solid ${C.pink}35`,
              color: C.text, fontSize: "0.85rem", fontWeight: 600,
            }}>
              {cat.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.bg }}>
        <div style={{ color: C.vivid, fontSize: "1.5rem", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800 }}>Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.bg, flexDirection: "column", gap: "1rem" }}>
        <div style={{ color: C.pink, fontSize: "3rem" }}>⛔</div>
        <h1 style={{ color: C.text, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2rem", margin: 0 }}>Access Denied</h1>
        <p style={{ color: C.muted, margin: 0 }}>You need admin privileges to access this area.</p>
        <Link href="/" style={{ color: C.vivid, fontWeight: 700, textDecoration: "none" }}>← Back to Store</Link>
      </div>
    );
  }

  const SIDEBAR_W = sidebarOpen ? 240 : 64;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Barlow', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: SIDEBAR_W,
        minWidth: SIDEBAR_W,
        background: C.sidebar,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s, min-width 0.2s",
        overflow: "hidden",
        position: "sticky",
        top: 0,
        height: "100vh",
        zIndex: 10,
      }}>
        {/* Logo area */}
        <div style={{
          padding: "1.25rem 1rem",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}>
          {sidebarOpen && (
            <span style={{ color: C.vivid, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.1rem", whiteSpace: "nowrap" }}>
              Admin Panel
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: C.muted, fontSize: "1.2rem", padding: "0.25rem",
              borderRadius: "0.4rem", transition: "color 0.15s",
              marginLeft: sidebarOpen ? "auto" : 0,
            }}
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "0.75rem 0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              title={item.label}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.65rem 0.75rem",
                borderRadius: "0.6rem",
                border: "none",
                background: tab === item.id ? `${C.vivid}20` : "transparent",
                color: tab === item.id ? C.vivid : C.muted,
                cursor: "pointer",
                fontWeight: tab === item.id ? 700 : 500,
                fontSize: "0.9rem",
                textAlign: "left",
                transition: "background 0.15s, color 0.15s",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom: back to store */}
        <div style={{ padding: "0.75rem 0.5rem", borderTop: `1px solid ${C.border}` }}>
          <Link
            href="/"
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.65rem 0.75rem",
              borderRadius: "0.6rem",
              color: C.muted,
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              transition: "color 0.15s",
            }}
          >
            <span style={{ flexShrink: 0 }}>←</span>
            {sidebarOpen && <span>Back to Store</span>}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, padding: "2rem", overflowY: "auto" }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "2rem", paddingBottom: "1rem",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div>
            <div style={{ color: C.muted, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
              Purple Co
            </div>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900, fontSize: "1.6rem",
              color: C.text, margin: 0,
            }}>
              {NAV_ITEMS.find(n => n.id === tab)?.label ?? "Dashboard"}
            </h1>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            padding: "0.5rem 1rem",
            background: `${C.vivid}12`,
            border: `1px solid ${C.vivid}30`,
            borderRadius: "999px",
          }}>
            <span style={{ color: C.vivid, fontSize: "0.75rem" }}>●</span>
            <span style={{ color: C.text, fontSize: "0.85rem", fontWeight: 600 }}>{user.name ?? user.email}</span>
            <span style={{
              background: `${C.pink}25`, color: C.pink,
              fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em",
              padding: "0.15rem 0.5rem", borderRadius: "999px", textTransform: "uppercase",
            }}>Admin</span>
          </div>
        </div>

        {/* Tab content */}
        {tab === "overview"    && <Overview />}
        {tab === "products"    && <AdminProducts />}
        {tab === "categories"  && <AdminCategories />}
        {tab === "lab-reports" && <AdminLabReports />}
        {tab === "users"       && <AdminUsers />}
      </main>
    </div>
  );
}
