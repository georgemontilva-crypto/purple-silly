import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ADMIN_COLORS as C, alpha } from "@/lib/adminTheme";
import {
  Briefcase,
  Download,
  ExternalLink,
  Paperclip,
  Search,
  Trash2,
  X,
} from "lucide-react";

const STATUSES = ["new", "contacted", "approved", "rejected"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<Status, string> = {
  new: "Nueva",
  contacted: "Contactado",
  approved: "Aprobada",
  rejected: "Rechazada",
};

function statusColor(status: string): string {
  switch (status) {
    case "approved":
      return C.green;
    case "contacted":
      return C.bright;
    case "rejected":
      return C.pink;
    default:
      return C.vivid;
  }
}

type Application = {
  id: number;
  businessName: string;
  dba: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  distributorType: string;
  notes: string | null;
  fileUrl: string | null;
  fileName: string | null;
  status: string;
  createdAt: string | Date;
};

/**
 * Excel opens a bare .csv in the system's local encoding and mangles any
 * accent, so the file leads with a UTF-8 BOM. Every field is quoted and
 * inner quotes doubled — these rows contain commas, apostrophes and
 * newlines from the notes box as a matter of course.
 */
function toCsv(rows: Application[]): string {
  const header = [
    "ID",
    "Fecha",
    "Estado",
    "Negocio",
    "DBA",
    "Nombre",
    "Apellido",
    "Teléfono",
    "Email",
    "Dirección",
    "Ciudad",
    "Estado/Provincia",
    "Código postal",
    "País",
    "Tipo",
    "Notas",
    "Archivo",
  ];
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map(r =>
    [
      r.id,
      new Date(r.createdAt).toISOString(),
      r.status,
      r.businessName,
      r.dba,
      r.firstName,
      r.lastName,
      r.phone,
      r.email,
      r.address,
      r.city,
      r.state,
      r.postalCode,
      r.country,
      r.distributorType,
      r.notes ?? "",
      r.fileUrl ?? "",
    ]
      .map(cell)
      .join(",")
  );
  return "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
}

export default function AdminWholesale() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [open, setOpen] = useState<Application | null>(null);

  const utils = trpc.useUtils();
  const { data: apps, isLoading } = trpc.wholesale.list.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const invalidate = () => utils.wholesale.invalidate();
  const setStatus = trpc.wholesale.setStatus.useMutation({
    onSuccess: invalidate,
  });
  const remove = trpc.wholesale.delete.useMutation({
    onSuccess: async () => {
      await invalidate();
      setOpen(null);
    },
  });

  function exportCsv() {
    if (!apps || apps.length === 0) return;
    const blob = new Blob([toCsv(apps as Application[])], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wholesale-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const panel: React.CSSProperties = {
    background: C.panel,
    border: `1px solid ${alpha(C.border, 25)}`,
    borderRadius: "0.75rem",
  };

  const field: React.CSSProperties = {
    padding: "0.55rem 0.7rem",
    background: C.panelAlt,
    border: `1px solid ${alpha(C.border, 35)}`,
    borderRadius: "0.45rem",
    color: C.text,
    fontSize: "0.85rem",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "2rem",
              color: C.text,
              margin: "0 0 0.25rem",
            }}
          >
            Mayoristas
          </h2>
          <p style={{ color: C.muted, fontSize: "0.9rem", margin: 0 }}>
            Solicitudes enviadas desde /wholesale, de la más reciente a la más
            antigua.
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!apps || apps.length === 0}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.55rem 1rem",
            borderRadius: "0.5rem",
            border: `1px solid ${alpha(C.border, 35)}`,
            background: "transparent",
            color: apps && apps.length ? C.bright : alpha(C.muted, 50),
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: apps && apps.length ? "pointer" : "default",
          }}
        >
          <Download size={15} /> Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "0.6rem",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: alpha(C.muted, 70),
            }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por negocio, nombre, email, ciudad…"
            style={{ ...field, width: "100%", paddingLeft: "2rem" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as Status | "")}
          style={{ ...field, minWidth: 160 }}
        >
          <option value="">Todos los estados</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p style={{ color: C.muted }}>Cargando…</p>
      ) : !apps || apps.length === 0 ? (
        <div
          style={{
            ...panel,
            padding: "2rem",
            textAlign: "center",
            color: C.muted,
          }}
        >
          <Briefcase
            size={28}
            style={{ margin: "0 auto 0.5rem", display: "block" }}
          />
          {search || statusFilter
            ? "Ninguna solicitud coincide con el filtro."
            : "Todavía no hay solicitudes."}
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
        >
          {(apps as Application[]).map(a => (
            <div
              key={a.id}
              style={{
                ...panel,
                padding: "1rem",
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 220 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <strong style={{ color: C.text, fontSize: "0.95rem" }}>
                    {a.businessName}
                  </strong>
                  <span
                    style={{
                      padding: "0.1rem 0.5rem",
                      borderRadius: 999,
                      background: alpha(statusColor(a.status), 20),
                      border: `1px solid ${alpha(statusColor(a.status), 45)}`,
                      color: statusColor(a.status),
                      fontSize: "0.65rem",
                      fontWeight: 800,
                    }}
                  >
                    {STATUS_LABEL[a.status as Status] ?? a.status}
                  </span>
                  {a.fileUrl && (
                    <Paperclip
                      size={13}
                      style={{ color: alpha(C.muted, 80) }}
                    />
                  )}
                </div>
                <p
                  style={{
                    color: C.muted,
                    fontSize: "0.8rem",
                    margin: "0.25rem 0 0",
                  }}
                >
                  {a.firstName} {a.lastName} · {a.email} · {a.city}, {a.state},{" "}
                  {a.country} · {a.distributorType}
                </p>
              </div>

              <span style={{ color: alpha(C.muted, 70), fontSize: "0.75rem" }}>
                {new Date(a.createdAt).toLocaleDateString("es")}
              </span>

              <button
                onClick={() => setOpen(a)}
                style={{
                  padding: "0 0.8rem",
                  height: 34,
                  borderRadius: "0.45rem",
                  background: "transparent",
                  border: `1px solid ${alpha(C.border, 35)}`,
                  color: C.bright,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Ver detalle
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Detail */}
      {open && (
        <div
          onMouseDown={e => {
            if (e.target === e.currentTarget) setOpen(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 500,
            display: "grid",
            placeItems: "center",
            padding: "1rem",
            background: "rgba(0,0,0,0.7)",
          }}
        >
          <div
            style={{
              ...panel,
              width: "min(680px, 100%)",
              maxHeight: "88vh",
              overflowY: "auto",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: C.text,
                    fontSize: "1.15rem",
                    fontWeight: 800,
                  }}
                >
                  {open.businessName}
                </h3>
                <p
                  style={{
                    margin: "0.2rem 0 0",
                    color: C.muted,
                    fontSize: "0.8rem",
                  }}
                >
                  Recibida el {new Date(open.createdAt).toLocaleString("es")}
                </p>
              </div>
              <button
                onClick={() => setOpen(null)}
                aria-label="Cerrar"
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 34,
                  height: 34,
                  borderRadius: "0.45rem",
                  background: "transparent",
                  border: `1px solid ${alpha(C.border, 35)}`,
                  color: C.muted,
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "0.85rem",
                margin: "0 0 1.25rem",
              }}
            >
              {(
                [
                  ["DBA / AKA", open.dba],
                  ["Contacto", `${open.firstName} ${open.lastName}`],
                  ["Teléfono", open.phone],
                  ["Email", open.email],
                  ["Dirección", open.address],
                  ["Ciudad", open.city],
                  ["Estado/Provincia", open.state],
                  ["Código postal", open.postalCode],
                  ["País", open.country],
                  ["Tipo", open.distributorType],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <dt
                    style={{
                      color: alpha(C.muted, 75),
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </dt>
                  <dd
                    style={{
                      margin: "0.15rem 0 0",
                      color: C.text,
                      fontSize: "0.88rem",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {open.notes && (
              <div style={{ marginBottom: "1.25rem" }}>
                <p
                  style={{
                    color: alpha(C.muted, 75),
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    margin: "0 0 0.35rem",
                  }}
                >
                  Notas
                </p>
                <p
                  style={{
                    margin: 0,
                    color: C.text,
                    fontSize: "0.88rem",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  {open.notes}
                </p>
              </div>
            )}

            {open.fileUrl && (
              <a
                href={open.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  marginBottom: "1.25rem",
                  padding: "0.55rem 1rem",
                  borderRadius: "0.5rem",
                  border: `1px solid ${alpha(C.border, 35)}`,
                  color: C.bright,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                <Paperclip size={15} />
                {open.fileName ?? "Archivo adjunto"}
                <ExternalLink size={13} />
              </a>
            )}

            <div
              style={{
                borderTop: `1px solid ${alpha(C.border, 25)}`,
                paddingTop: "1rem",
              }}
            >
              <p
                style={{
                  color: alpha(C.muted, 75),
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  margin: "0 0 0.5rem",
                }}
              >
                Estado
              </p>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatus.mutate({ id: open.id, status: s });
                      setOpen({ ...open, status: s });
                    }}
                    style={{
                      padding: "0.4rem 0.85rem",
                      borderRadius: 999,
                      border: `1px solid ${alpha(statusColor(s), open.status === s ? 70 : 30)}`,
                      background:
                        open.status === s
                          ? alpha(statusColor(s), 22)
                          : "transparent",
                      color: open.status === s ? statusColor(s) : C.muted,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}

                <button
                  onClick={() => {
                    // Deleting also removes the attachment from R2, so it
                    // can't be undone by re-adding the row.
                    if (
                      confirm(
                        `¿Borrar la solicitud de ${open.businessName}? También se borra el archivo adjunto.`
                      )
                    ) {
                      remove.mutate({ id: open.id });
                    }
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    marginLeft: "auto",
                    padding: "0.4rem 0.85rem",
                    borderRadius: 999,
                    border: `1px solid ${alpha(C.pink, 35)}`,
                    background: "transparent",
                    color: C.pink,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={14} /> Borrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
