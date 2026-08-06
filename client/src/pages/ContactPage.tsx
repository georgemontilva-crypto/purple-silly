import { useState } from "react";
import { toast } from "sonner";
import AnnouncementBar from "@/components/AnnouncementBar";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you within 1–2 business days.");
      setForm({ name: "", email: "", message: "" });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <main className="flex-1 py-16">
        <div className="max-w-[680px] mx-auto px-4 sm:px-6">
          <h1 className="font-condensed font-black text-5xl md:text-6xl text-white tracking-tight mb-3">
            Contact Us
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            Have a question or need assistance? We'd love to hear from you.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">Name *</label>
              <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-[oklch(0.16_0.06_295)] text-white placeholder:text-muted-foreground focus:border-[oklch(0.72_0.22_320)] focus:outline-none text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-[oklch(0.16_0.06_295)] text-white placeholder:text-muted-foreground focus:border-[oklch(0.72_0.22_320)] focus:outline-none text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">Message *</label>
              <textarea required rows={6} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-[oklch(0.16_0.06_295)] text-white placeholder:text-muted-foreground focus:border-[oklch(0.72_0.22_320)] focus:outline-none text-sm transition-colors resize-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full text-white font-extrabold text-base py-4 rounded-xl transition-transform active:scale-[0.97] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, oklch(0.62 0.28 295), oklch(0.72 0.22 320))" }}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
          <div className="mt-10 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <p className="font-bold text-foreground mb-1">Phone</p>
              <a href="tel:+18555526874" className="hover:text-[oklch(0.72_0.22_320)] transition-colors">(855) 552-6874</a>
            </div>
            <div>
              <p className="font-bold text-foreground mb-1">Email</p>
              <a href="mailto:info@purple-co.com" className="hover:text-[oklch(0.72_0.22_320)] transition-colors">info@purple-co.com</a>
            </div>
            <div>
              <p className="font-bold text-foreground mb-1">Address</p>
              <address className="not-italic">5101 Tampa West Blvd, Suite 200<br />Tampa, FL 33634</address>
            </div>
            <div>
              <p className="font-bold text-foreground mb-1">Help Center</p>
              <a href="http://help.purple-co.com/" target="_blank" rel="noopener noreferrer"
                className="hover:text-[oklch(0.72_0.22_320)] transition-colors">help.purple-co.com</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
