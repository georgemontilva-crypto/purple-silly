import { useState } from "react";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      toast.success("You're on the list! 🎉");
      setEmail("");
      setLoading(false);
    }, 800);
  };

  return (
    <section className="py-16 md:py-20 bg-[oklch(0.92_0.18_95)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h2 className="font-condensed font-black text-3xl md:text-4xl text-[oklch(0.13_0.04_265)] tracking-tight mb-2">
              Stay in the Loop
            </h2>
            <p className="text-[oklch(0.22_0.08_265)]/70 text-base font-medium">
              Get exclusive deals, new product drops, and Kanna education.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Email form */}
            <form onSubmit={handleSubmit} className="flex gap-2 flex-1 md:w-80">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[oklch(0.22_0.08_265)]/20 bg-white text-[oklch(0.22_0.08_265)] placeholder-[oklch(0.22_0.08_265)]/40 text-sm font-medium focus:outline-none focus:border-[oklch(0.22_0.08_265)] transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[oklch(0.22_0.08_265)] text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-[oklch(0.15_0.04_265)] transition-colors active:scale-[0.97] disabled:opacity-60 whitespace-nowrap">
                Subscribe
              </button>
            </form>
            {/* SMS button */}
            <button
              onClick={() => toast.info("SMS sign-up coming soon!")}
              className="bg-[oklch(0.62_0.25_340)] text-white px-6 py-3 rounded-xl font-extrabold text-sm hover:bg-[oklch(0.55_0.25_340)] transition-colors active:scale-[0.97] tracking-wide whitespace-nowrap">
              SIGN UP FOR TEXTS
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

