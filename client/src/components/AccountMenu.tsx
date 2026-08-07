import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * The navbar's account control.
 *
 * Signed out it's a plain link to /login — no menu, nothing to open, one
 * tap. Signed in it opens a small menu, because there are then two
 * destinations ("My account", "Sign out") and a bare icon can only have
 * one. Same component on desktop and mobile; only the icon's size differs.
 */
export default function AccountMenu({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  // Close on outside click and on Escape — the same pair the SHOP dropdown
  // uses, so the two behave alike.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const iconSize = compact ? 20 : 22;

  const triggerStyle: React.CSSProperties = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: "999px",
    background: "none",
    border: "none",
    color: "white",
    textDecoration: "none",
    cursor: "pointer",
  };

  if (!isAuthenticated) {
    return (
      <Link href="/login" aria-label="Sign in" style={triggerStyle}>
        <User size={iconSize} />
      </Link>
    );
  }

  const handleSignOut = async () => {
    setOpen(false);
    await logout();
    setLocation("/");
  };

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    width: "100%",
    minHeight: 44,
    padding: "0 1rem",
    background: "none",
    border: "none",
    color: "white",
    fontSize: "0.88rem",
    fontWeight: 700,
    textAlign: "left",
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        style={triggerStyle}
      >
        <User size={iconSize} />
        {/* A dot rather than a name: the navbar has no room for one on a
            phone, and the dot still says "you are signed in". */}
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: "999px",
            background: "#a855f7",
            border: "1.5px solid oklch(0.13 0.05 295)",
          }}
        />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 0.5rem)",
            // Anchored to the right edge: this control sits at the end of the
            // bar, so a left-anchored menu would run off screen on a phone.
            right: 0,
            minWidth: 220,
            padding: "0.5rem 0",
            borderRadius: "0.85rem",
            background: "oklch(0.13 0.05 295)",
            border: "1px solid oklch(0.30 0.09 295)",
            boxShadow: "0 24px 50px -20px rgba(0,0,0,0.8)",
            zIndex: 210,
          }}
        >
          <div
            style={{
              padding: "0.35rem 1rem 0.6rem",
              borderBottom: "1px solid oklch(0.24 0.07 295)",
              marginBottom: "0.35rem",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "oklch(0.65 0.10 295)",
              }}
            >
              Signed in as
            </p>
            <p
              style={{
                margin: "0.15rem 0 0",
                fontSize: "0.85rem",
                fontWeight: 800,
                color: "white",
                overflowWrap: "anywhere",
              }}
            >
              {user?.name || user?.email}
            </p>
          </div>

          <Link
            href="/account"
            role="menuitem"
            style={itemStyle}
            onClick={() => setOpen(false)}
          >
            <User size={16} aria-hidden="true" /> My account
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              role="menuitem"
              style={itemStyle}
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={16} aria-hidden="true" /> Admin dashboard
            </Link>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            style={itemStyle}
          >
            <LogOut size={16} aria-hidden="true" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
