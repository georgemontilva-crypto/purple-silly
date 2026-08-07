import { Link, useLocation } from "wouter";
import { BadgeCheck, Clock3, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import AuthShell from "@/components/auth/AuthShell";

/**
 * Where the navbar's "My account" goes. Deliberately small — it exists so
 * the account menu has somewhere real to point, and so a signed-in visitor
 * can see which address their orders and verification mail go to.
 */
export default function Account() {
  const { user, loading, logout } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const [, setLocation] = useLocation();

  if (loading || !user) {
    return (
      <AuthShell title="My account">
        <p className="auth-subtitle" style={{ margin: 0 }} role="status">
          Loading your details…
        </p>
      </AuthShell>
    );
  }

  const handleSignOut = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <AuthShell
      eyebrow="Signed in"
      title="My account"
      footer={
        <>
          Questions about an order?{" "}
          <Link href="/pages/contact">Contact us</Link>
        </>
      }
    >
      <div className="auth-rows">
        <div className="auth-row">
          <span className="auth-row__label">Name</span>
          <span className="auth-row__value">{user.name || "—"}</span>
        </div>
        <div className="auth-row">
          <span className="auth-row__label">Email</span>
          <span className="auth-row__value">{user.email}</span>
        </div>
        <div className="auth-row">
          <span className="auth-row__label">Email status</span>
          <span className="auth-row__value">
            {user.emailVerified ? (
              <span className="auth-badge auth-badge--ok">
                <BadgeCheck size={13} aria-hidden="true" /> Verified
              </span>
            ) : (
              <span className="auth-badge auth-badge--pending">
                <Clock3 size={13} aria-hidden="true" /> Pending
              </span>
            )}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {/* Admins reach the dashboard from here too — it's the only signed-in
            page a non-admin and an admin both land on. */}
        {user.role === "admin" && (
          <Link
            href="/admin"
            className="auth-secondary"
            style={{
              display: "grid",
              placeItems: "center",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <LayoutDashboard size={15} aria-hidden="true" /> Admin dashboard
            </span>
          </Link>
        )}
        <button type="button" className="auth-submit" onClick={handleSignOut}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
            }}
          >
            <LogOut size={16} aria-hidden="true" /> Sign out
          </span>
        </button>
      </div>
    </AuthShell>
  );
}
