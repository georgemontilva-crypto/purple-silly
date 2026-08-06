import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Download, Loader2, Mail, Users as LeadsIcon } from "lucide-react";
import { ADMIN_COLORS as C, alpha } from "@/lib/adminTheme";

function statusColor(status: string) {
  switch (status) {
    case "converted":
      return C.vivid;
    case "contacted":
      return C.pink;
    case "unsubscribed":
      return C.muted;
    default:
      return C.bright;
  }
}

function toCsv(rows: { id: number; email: string; source: string; status: string; createdAt: string | Date }[]) {
  const header = ["ID", "Email", "Source", "Status", "Created At"];
  const lines = rows.map(r =>
    [r.id, r.email, r.source, r.status, new Date(r.createdAt).toISOString()]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

export default function AdminLeads() {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const { data: leads, isLoading } = trpc.leads.list.useQuery({ search: search || undefined });

  function handleExport() {
    if (!leads || leads.length === 0) return;
    const csv = toCsv(leads);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h2
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: "1.6rem",
            color: C.text,
            margin: 0,
          }}
        >
          Leads ({leads?.length ?? 0})
        </h2>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              background: C.panel,
              border: `1px solid ${searchFocused ? C.vivid : alpha(C.border, 35)}`,
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              color: C.text,
              fontSize: "0.9rem",
              outline: "none",
              minWidth: 200,
              transition: "border-color 0.15s",
            }}
          />
          <button
            onClick={handleExport}
            disabled={!leads || leads.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: `1px solid ${alpha(C.border, 35)}`,
              background: "transparent",
              color: C.text,
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: leads && leads.length > 0 ? "pointer" : "not-allowed",
              opacity: leads && leads.length > 0 ? 1 : 0.5,
            }}
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            title="Coming soon"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: "none",
              background: `linear-gradient(135deg, ${C.vivid}, ${C.pink})`,
              color: "white",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "not-allowed",
              opacity: 0.6,
            }}
            disabled
          >
            <Mail size={15} /> Send Coupon
          </button>
        </div>
      </div>

      {isLoading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            color: C.muted,
            padding: "3rem",
            fontSize: "0.9rem",
          }}
        >
          <Loader2 size={18} className="animate-spin" /> Loading leads...
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${alpha(C.border, 35)}` }}>
                {["ID", "Email", "Source", "Status", "Created"].map(h => (
                  <th
                    key={h}
                    style={{
                      color: C.muted,
                      fontWeight: 700,
                      textAlign: "left",
                      padding: "0.6rem 0.75rem",
                      whiteSpace: "nowrap",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads?.map(l => (
                <tr key={l.id} style={{ borderBottom: `1px solid ${alpha(C.border, 20)}` }}>
                  <td style={{ padding: "0.75rem", color: C.muted }}>{l.id}</td>
                  <td style={{ padding: "0.75rem", color: C.text, fontWeight: 600 }}>{l.email}</td>
                  <td style={{ padding: "0.75rem", color: C.muted }}>{l.source}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background: alpha(statusColor(l.status), 18),
                        color: statusColor(l.status),
                      }}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", color: C.muted, whiteSpace: "nowrap" }}>
                    {new Date(l.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!leads || leads.length === 0) && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                color: C.muted,
                padding: "3rem",
                textAlign: "center",
              }}
            >
              <LeadsIcon size={28} style={{ opacity: 0.5 }} />
              <span style={{ fontSize: "0.9rem" }}>No leads yet.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
