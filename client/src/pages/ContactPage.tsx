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
          <h1 className="font-condensed font-black text-5xl md:text-6xl text-[oklch(0.22_0.08_265)] tracking-tight mb-3">
            Contact Us
          </h1>
          <p className="text-gray-500 text-lg mb-10">
            Have a question or need assistance? We'd love to hear from you.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[oklch(0.22_0.08_265)] mb-1.5">Name *</label>
              <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[oklch(0.62_0.25_340)] focus:outline-none text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[oklch(0.22_0.08_265)] mb-1.5">Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[oklch(0.62_0.25_340)] focus:outline-none text-sm transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[oklch(0.22_0.08_265)] mb-1.5">Message *</label>
              <textarea required rows={6} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[oklch(0.62_0.25_340)] focus:outline-none text-sm transition-colors resize-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[oklch(0.22_0.08_265)] text-white font-extrabold text-base py-4 rounded-xl hover:bg-[oklch(0.62_0.25_340)] transition-colors active:scale-[0.97] disabled:opacity-60">
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
          <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <p className="font-bold text-[oklch(0.22_0.08_265)] mb-1">Phone</p>
              <a href="tel:+18555526874" className="hover:text-[oklch(0.62_0.25_340)] transition-colors">(855) 552-6874</a>
            </div>
            <div>
              <p className="font-bold text-[oklch(0.22_0.08_265)] mb-1">Email</p>
              <a href="mailto:info@getferriswheel.com" className="hover:text-[oklch(0.62_0.25_340)] transition-colors">info@getferriswheel.com</a>
            </div>
            <div>
              <p className="font-bold text-[oklch(0.22_0.08_265)] mb-1">Address</p>
              <address className="not-italic">5101 Tampa West Blvd, Suite 200<br />Tampa, FL 33634</address>
            </div>
            <div>
              <p className="font-bold text-[oklch(0.22_0.08_265)] mb-1">Help Center</p>
              <a href="http://help.getferriswheel.com/" target="_blank" rel="noopener noreferrer"
                className="hover:text-[oklch(0.62_0.25_340)] transition-colors">help.getferriswheel.com</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

