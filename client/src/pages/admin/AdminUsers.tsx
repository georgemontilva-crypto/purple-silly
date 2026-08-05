import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const C = {
  bg:     "oklch(0.07 0.04 295)",
  border: "oklch(0.18 0.06 295)",
  vivid:  "oklch(0.52 0.28 295)",
  pink:   "oklch(0.72 0.22 320)",
  text:   "oklch(0.92 0.02 295)",
  muted:  "oklch(0.55 0.07 295)",
  row:    "oklch(0.11 0.05 295)",
};

export default function AdminUsers() {
  const { data: users, isLoading, refetch } = trpc.admin.users.list.useQuery();
  const updateRole = trpc.admin.users.updateRole.useMutation({
    onSuccess: () => { refetch(); toast.success("Role updated"); },
    onError: (e) => toast.error(e.message),
  });
  const [search, setSearch] = useState("");

  const filtered = users?.filter(u =>
    (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "1.6rem", color: C.text, margin: 0 }}>
          Users ({users?.length ?? 0})
        </h2>
        <input
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: `${C.vivid}10`, border: `1px solid ${C.border}`,
            borderRadius: "0.5rem", padding: "0.5rem 1rem",
            color: C.text, fontSize: "0.9rem", outline: "none",
            minWidth: 200,
          }}
        />
      </div>

      {isLoading ? (
        <div style={{ color: C.muted, padding: "2rem", textAlign: "center" }}>Loading users...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["ID", "Name", "Email", "Role", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ color: C.muted, fontWeight: 700, textAlign: "left", padding: "0.6rem 0.75rem", whiteSpace: "nowrap", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}30` }}>
                  <td style={{ padding: "0.75rem", color: C.muted }}>{u.id}</td>
                  <td style={{ padding: "0.75rem", color: C.text, fontWeight: 600 }}>{u.name ?? "—"}</td>
                  <td style={{ padding: "0.75rem", color: C.muted }}>{u.email ?? "—"}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{
                      padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
                      background: u.role === "admin" ? `${C.pink}25` : `${C.vivid}15`,
                      color: u.role === "admin" ? C.pink : C.vivid,
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", color: C.muted, whiteSpace: "nowrap" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <button
                      onClick={() => updateRole.mutate({ userId: u.id, role: u.role === "admin" ? "user" : "admin" })}
                      disabled={updateRole.isPending}
                      style={{
                        padding: "0.3rem 0.75rem", borderRadius: "0.4rem", fontSize: "0.75rem",
                        border: `1px solid ${C.border}`, background: "transparent",
                        color: C.muted, cursor: "pointer", fontWeight: 600,
                        transition: "color 0.15s, border-color 0.15s",
                      }}
                    >
                      {u.role === "admin" ? "Revoke Admin" : "Make Admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ color: C.muted, padding: "2rem", textAlign: "center" }}>No users found.</div>
          )}
        </div>
      )}
    </div>
  );
}
