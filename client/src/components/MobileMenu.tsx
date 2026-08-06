import { useEffect, useState } from "react";
import { Link } from "wouter";
import { X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface MobileMenuLink {
  label: string;
  href: string;
}

// Full-screen mobile nav overlay. Deliberately no social links here — per
// spec this menu is just navigation + the coupon capture field below.
export default function MobileMenu({
  open,
  onClose,
  links,
}: {
  open: boolean;
  onClose: () => void;
  links: MobileMenuLink[];
}) {
  const [email, setEmail] = useState("");
  const createLead = trpc.leads.create.useMutation();

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    createLead.mutate(
      { email: email.trim(), source: "mobile-menu-coupon" },
      {
        onSuccess: () => {
          toast.success("¡Gracias! Te vamos a mandar el cupón por correo.");
          setEmail("");
        },
        onError: () => {
          toast.error("Algo salió mal. Intenta de nuevo.");
        },
      }
    );
  }

  return (
    <div
      className="flex md:hidden flex-col"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "oklch(0.07 0.04 295)",
      }}
    >
      {/* Header: close button */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "1.25rem" }}>
        <button
          onClick={onClose}
          aria-label="Close menu"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 44, height: 44, borderRadius: "999px",
            background: "oklch(0.16 0.06 295)", border: "1px solid oklch(0.28 0.09 295)",
            color: "white", cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Links */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "0.5rem 1.75rem" }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {links.map((link, i) => (
            <li key={link.href} style={{ borderBottom: i < links.length - 1 ? "1px solid oklch(0.20 0.06 295 / 0.6)" : "none" }}>
              <Link
                href={link.href}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: 60,
                  color: "white",
                  textDecoration: "none",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "2rem",
                  letterSpacing: "0.01em",
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Coupon email capture — visual only for now */}
      <form onSubmit={handleSubmit} style={{ padding: "1.5rem 1.75rem 2rem", borderTop: "1px solid oklch(0.20 0.06 295 / 0.6)" }}>
        <p style={{ color: "oklch(0.65 0.10 295)", fontSize: "0.8rem", fontWeight: 600, margin: "0 0 0.75rem" }}>
          Solicitar cupón de descuento
        </p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            style={{
              flex: 1,
              minHeight: 48,
              padding: "0 1rem",
              borderRadius: "999px",
              background: "oklch(0.14 0.05 295)",
              border: "1px solid oklch(0.28 0.09 295)",
              color: "white",
              fontSize: "0.95rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            style={{
              minHeight: 48,
              padding: "0 1.5rem",
              borderRadius: "999px",
              background: "linear-gradient(135deg, oklch(0.62 0.28 295), oklch(0.72 0.22 320))",
              border: "none",
              color: "white",
              fontWeight: 800,
              fontSize: "0.9rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
