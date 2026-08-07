import { useRef, useState } from "react";
import { CheckCircle2, FileUp, Loader2, Paperclip, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { useSiteAsset } from "@/hooks/useSiteAssets";
import { AssetPlaceholder } from "@/components/AssetPlaceholder";
import { AmbientGlow } from "@/components/motion/AmbientGlow";
import "./WholesalePage.css";

const DISTRIBUTOR_TYPES = [
  "1 Store",
  "2-5 Store",
  "5+ Store",
  "Distributor",
] as const;
type DistributorType = (typeof DISTRIBUTOR_TYPES)[number];

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_BYTES = 10 * 1024 * 1024;

interface Form {
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
  distributorType: DistributorType | "";
  notes: string;
}

const EMPTY: Form = {
  businessName: "",
  dba: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: DEFAULT_COUNTRY,
  distributorType: "",
  notes: "",
};

/** Field order matches the brief exactly; `half` lays two to a row on desktop. */
const FIELDS: {
  name: keyof Form;
  label: string;
  type?: string;
  half?: boolean;
}[] = [
  { name: "businessName", label: "Name of Business" },
  { name: "dba", label: "DBA or AKA" },
  { name: "firstName", label: "First Name", half: true },
  { name: "lastName", label: "Last Name", half: true },
  { name: "phone", label: "Phone Number", type: "tel", half: true },
  { name: "email", label: "Email", type: "email", half: true },
  { name: "address", label: "Address" },
  { name: "city", label: "City", half: true },
  { name: "state", label: "State/Province", half: true },
  { name: "postalCode", label: "Postal code", half: true },
];

/**
 * PUTs the attachment straight to R2 with the presigned URL.
 *
 * XHR rather than fetch purely for `upload.onprogress` — fetch still can't
 * report upload progress, and a 10MB scan over a phone connection with no
 * feedback looks like a frozen page.
 */
function putToR2(
  uploadUrl: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = e => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status}). Please try again.`));
    xhr.onerror = () =>
      reject(
        new Error("Upload failed. Please check your connection and try again.")
      );
    xhr.send(file);
  });
}

export default function WholesalePage() {
  const { asset: hero } = useSiteAsset("wholesale-hero");

  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const createUploadUrl = trpc.wholesale.createUploadUrl.useMutation();
  const submit = trpc.wholesale.submit.useMutation();
  const busy = submit.isPending || progress !== null;

  const set = (name: keyof Form, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }));
  };

  function pickFile(picked: File | undefined) {
    setFormError(null);
    if (!picked) return;
    if (!ALLOWED_TYPES.includes(picked.type)) {
      setFormError("Please attach a PDF, image or Word document.");
      return;
    }
    if (picked.size > MAX_BYTES) {
      setFormError("That file is larger than 10MB.");
      return;
    }
    setFile(picked);
  }

  function validate(): boolean {
    const next: Partial<Record<keyof Form, string>> = {};
    for (const f of FIELDS) {
      if (!form[f.name].trim()) next[f.name] = "Required";
    }
    if (!form.country.trim()) next.country = "Required";
    if (!form.distributorType) next.distributorType = "Required";
    if (
      form.email.trim() &&
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())
    ) {
      next.email = "Enter a valid email address";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!validate()) {
      // Take the reader to the first problem rather than leaving them to
      // hunt for it in a form this long.
      document.querySelector(".wholesale-field--invalid")?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
      return;
    }

    try {
      // The attachment goes up FIRST, so the row is only written once the
      // file it references is actually in the bucket.
      let fileKey: string | undefined;
      let fileUrl: string | undefined;
      let fileName: string | undefined;

      if (file) {
        setProgress(0);
        const signed = await createUploadUrl.mutateAsync({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
        });
        await putToR2(signed.uploadUrl, file, setProgress);
        fileKey = signed.key;
        fileUrl = signed.publicUrl;
        fileName = file.name;
        setProgress(null);
      }

      await submit.mutateAsync({
        businessName: form.businessName.trim(),
        dba: form.dba.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postalCode: form.postalCode.trim(),
        country: form.country,
        distributorType: form.distributorType as DistributorType,
        notes: form.notes.trim() || undefined,
        fileKey,
        fileUrl,
        fileName,
      });

      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setProgress(null);
      setFormError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <div className="wholesale ambient-glow-host">
      <AmbientGlow variant="a" />

      <header className="wholesale__hero">
        {hero ? (
          <img
            className="wholesale__hero-img"
            src={hero.url}
            alt=""
            aria-hidden="true"
          />
        ) : (
          /* Editable from /admin → Assets under "wholesale-hero"; until one
             is uploaded this shows the exact slot rather than collapsing. */
          <div className="wholesale__hero-placeholder">
            <AssetPlaceholder width={1920} height={600} variant="dark" />
          </div>
        )}
        <div className="wholesale__hero-overlay" />
        <div className="wholesale__hero-copy">
          <p className="wholesale__eyebrow">Wholesale</p>
          <h1 className="wholesale__title">PARTNER WITH US TODAY!</h1>
          <p className="wholesale__lede">
            Tell us about your business and our wholesale team will be in touch.
          </p>
        </div>
      </header>

      <main className="wholesale__body">
        {done ? (
          <div className="wholesale-done" role="status">
            <span className="wholesale-done__icon">
              <CheckCircle2 size={30} aria-hidden="true" />
            </span>
            <h2 className="wholesale-done__title">Application received</h2>
            <p className="wholesale-done__text">
              Thanks — we have your details. Our wholesale team reviews every
              application and will reach out at{" "}
              <strong>{form.email.trim()}</strong>.
            </p>
          </div>
        ) : (
          <form className="wholesale-form" onSubmit={handleSubmit} noValidate>
            <div className="wholesale-grid">
              {FIELDS.map(f => (
                <div
                  key={f.name}
                  className={
                    "wholesale-field" +
                    (f.half ? " wholesale-field--half" : "") +
                    (errors[f.name] ? " wholesale-field--invalid" : "")
                  }
                >
                  <label className="wholesale-label" htmlFor={`ws-${f.name}`}>
                    {f.label} <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={`ws-${f.name}`}
                    className="wholesale-input"
                    type={f.type ?? "text"}
                    value={form[f.name]}
                    onChange={e => set(f.name, e.target.value)}
                    aria-invalid={errors[f.name] ? true : undefined}
                    aria-describedby={
                      errors[f.name] ? `ws-${f.name}-err` : undefined
                    }
                    required
                  />
                  {errors[f.name] && (
                    <p className="wholesale-error" id={`ws-${f.name}-err`}>
                      {errors[f.name]}
                    </p>
                  )}
                </div>
              ))}

              <div
                className={
                  "wholesale-field wholesale-field--half" +
                  (errors.country ? " wholesale-field--invalid" : "")
                }
              >
                <label className="wholesale-label" htmlFor="ws-country">
                  Country <span aria-hidden="true">*</span>
                </label>
                <select
                  id="ws-country"
                  className="wholesale-input"
                  value={form.country}
                  onChange={e => set("country", e.target.value)}
                  required
                >
                  {COUNTRIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className={
                  "wholesale-field" +
                  (errors.distributorType ? " wholesale-field--invalid" : "")
                }
              >
                <label className="wholesale-label" htmlFor="ws-type">
                  Are you a wholesale distributor or retailer?{" "}
                  <span aria-hidden="true">*</span>
                </label>
                <select
                  id="ws-type"
                  className="wholesale-input"
                  value={form.distributorType}
                  onChange={e => set("distributorType", e.target.value)}
                  aria-invalid={errors.distributorType ? true : undefined}
                  required
                >
                  <option value="">Select one…</option>
                  {DISTRIBUTOR_TYPES.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.distributorType && (
                  <p className="wholesale-error">{errors.distributorType}</p>
                )}
              </div>

              <div className="wholesale-field">
                <label className="wholesale-label" htmlFor="ws-notes">
                  Notes / Anything else we should know about your business?
                </label>
                <textarea
                  id="ws-notes"
                  className="wholesale-input wholesale-textarea"
                  rows={4}
                  maxLength={4000}
                  value={form.notes}
                  onChange={e => set("notes", e.target.value)}
                />
              </div>

              {/* Attachment. The whole panel is the drop target and the
                  click target, so there is no small "browse" link to hit. */}
              <div className="wholesale-field">
                <label className="wholesale-label" htmlFor="ws-file">
                  Attachment{" "}
                  <span className="wholesale-optional">optional</span>
                </label>

                <div
                  className={
                    "wholesale-drop" + (dragging ? " wholesale-drop--over" : "")
                  }
                  onDragOver={e => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragging(false);
                    pickFile(e.dataTransfer.files?.[0]);
                  }}
                  onClick={() => fileInput.current?.click()}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInput.current?.click();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {file ? (
                    <div className="wholesale-file">
                      <Paperclip size={16} aria-hidden="true" />
                      <span className="wholesale-file__name">{file.name}</span>
                      <button
                        type="button"
                        className="wholesale-file__remove"
                        aria-label="Remove attachment"
                        onClick={e => {
                          e.stopPropagation();
                          setFile(null);
                          if (fileInput.current) fileInput.current.value = "";
                        }}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <FileUp size={22} aria-hidden="true" />
                      <p className="wholesale-drop__title">
                        Drag a file here, or tap to choose
                      </p>
                      <p className="wholesale-drop__hint">
                        PDF, image or Word document · up to 10MB
                      </p>
                    </>
                  )}
                </div>

                <input
                  ref={fileInput}
                  id="ws-file"
                  type="file"
                  className="sr-only"
                  accept={ALLOWED_TYPES.join(",")}
                  onChange={e => pickFile(e.target.files?.[0])}
                />

                {progress !== null && (
                  <div className="wholesale-progress">
                    <div
                      className="wholesale-progress__bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {formError && (
              <p className="wholesale-form-error" role="alert">
                {formError}
              </p>
            )}

            <button type="submit" className="wholesale-submit" disabled={busy}>
              {busy && (
                <Loader2
                  size={17}
                  className="animate-spin"
                  aria-hidden="true"
                />
              )}
              {progress !== null
                ? `Uploading… ${progress}%`
                : submit.isPending
                  ? "Sending…"
                  : "Submit application"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
