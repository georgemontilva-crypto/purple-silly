import AnnouncementBar from "@/components/AnnouncementBar";
import NewsletterSection from "@/components/NewsletterSection";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <main className="flex-1 py-16">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6">
          <h1 className="font-condensed font-black text-5xl md:text-6xl text-[oklch(0.22_0.08_265)] tracking-tight mb-8">
            About Us
          </h1>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p>
              Founded in 2026, Ferris Wheel is a U.S.-based company dedicated to providing high-quality kanna products to adults 21+. Our founders have over a decade of experience in the wellness supplement industry. As a result of that expertise, we have been able to craft the finest kanna products on the market.
            </p>
            <p>
              At Ferris Wheel, we believe in the uplifting power of the kanna plant, and we want to provide our customers with quality products they can actually feel. With that in mind, we only use the finest ingredients and safest manufacturing practices, and all of our products are backed by a Certificate of Analysis.
            </p>
            <p>
              We want your kanna experience to be safe and satisfying every time!
            </p>
            <div className="bg-[oklch(0.97_0.005_265)] rounded-3xl p-8 mt-8">
              <h2 className="font-condensed font-black text-3xl text-[oklch(0.22_0.08_265)] tracking-tight mb-4">
                A Commitment to Quality
              </h2>
              <p>
                Ferris Wheel's commitment to quality begins with our kanna sourcing, as we use only the highest-quality kanna along with 100% natural ingredients. All of our products are manufactured in cGMP (Current Good Manufacturing Process) facilities and are tested in independent, ISO-certified laboratories to ensure purity, potency, and safety.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
              {[
                { icon: "🌿", title: "100% Natural", desc: "Only the finest natural ingredients in every product." },
                { icon: "🔬", title: "Third-Party Tested", desc: "Every batch independently verified for purity and potency." },
                { icon: "🏭", title: "cGMP Certified", desc: "Manufactured in facilities meeting the highest standards." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
                  <div className="text-3xl mb-3">{icon}</div>
                  <h3 className="font-bold text-sm text-[oklch(0.22_0.08_265)] mb-1">{title}</h3>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 flex gap-4">
            <Link href="/collections/all"
              className="bg-[oklch(0.22_0.08_265)] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[oklch(0.62_0.25_340)] transition-colors">
              Shop Products
            </Link>
            <Link href="/pages/faq"
              className="border-2 border-[oklch(0.22_0.08_265)] text-[oklch(0.22_0.08_265)] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[oklch(0.22_0.08_265)] hover:text-white transition-colors">
              Read FAQ
            </Link>
          </div>
        </div>
      </main>
      <NewsletterSection />
    </div>
  );
}

