import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Users as UsersIcon } from "lucide-react";
import { ADMIN_COLORS as C, alpha } from "@/lib/adminTheme";

function RoleButton({ isAdmin, onClick, disabled }: { isAdmin: boolean; onClick: () => void; disabled: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "0.3rem 0.75rem", borderRadius: "0.4rem", fontSize: "0.75rem",
        border: `1px solid ${hover ? C.vivid : alpha(C.border, 35)}`,
        background: hover ? alpha(C.vivid, 15) : "transparent",
        color: hover ? C.bright : C.muted, cursor: "pointer", fontWeight: 600,
        transition: "color 0.15s, background 0.15s, border-color 0.15s",
      }}
    >
      {isAdmin ? "Revoke Admin" : "Make Admin"}
    </button>
  );
}

export default function AdminUsers() {
  const { data: users, isLoading, refetch } = trpc.admin.users.list.useQuery();
  const updateRole = trpc.admin.users.updateRole.useMutation({
    onSuccess: () => { refetch(); toast.success("Role updated"); },
    onError: (e) => toast.error(e.message),
  });
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = users?.filter(u =>
    (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
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
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            background: C.panel, border: `1px solid ${searchFocused ? C.vivid : alpha(C.border, 35)}`,
            borderRadius: "0.5rem", padding: "0.5rem 1rem",
            color: C.text, fontSize: "0.9rem", outline: "none",
            minWidth: 200, transition: "border-color 0.15s",
          }}
        />
      </div>

      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: C.muted, padding: "3rem", fontSize: "0.9rem" }}>
          <Loader2 size={18} className="animate-spin" /> Cargando usuarios...
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${alpha(C.border, 35)}` }}>
                {["ID", "Name", "Email", "Role", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ color: C.muted, fontWeight: 700, textAlign: "left", padding: "0.6rem 0.75rem", whiteSpace: "nowrap", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${alpha(C.border, 20)}` }}>
                  <td style={{ padding: "0.75rem", color: C.muted }}>{u.id}</td>
                  <td style={{ padding: "0.75rem", color: C.text, fontWeight: 600 }}>{u.name ?? "—"}</td>
                  <td style={{ padding: "0.75rem", color: C.muted }}>{u.email}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{
                      padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
                      background: u.role === "admin" ? alpha(C.pink, 25) : alpha(C.vivid, 18),
                      color: u.role === "admin" ? C.pink : C.bright,
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", color: C.muted, whiteSpace: "nowrap" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <RoleButton
                      isAdmin={u.role === "admin"}
                      disabled={updateRole.isPending}
                      onClick={() => updateRole.mutate({ userId: u.id, role: u.role === "admin" ? "user" : "admin" })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: C.muted, padding: "3rem", textAlign: "center" }}>
              <UsersIcon size={28} style={{ opacity: 0.5 }} />
              <span style={{ fontSize: "0.9rem" }}>No users found.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
