import { useParams } from "wouter";

/**
 * Legacy /pages/:slug policies.
 *
 * The privacy, terms, shipping and refund entries that used to live here
 * were placeholder text written from scratch — they said different things
 * from the policies the business actually publishes. They're gone; those
 * four URLs now redirect to /policies/* in App.tsx, which serves the
 * client's real wording.
 *
 * Only "do-not-sell" remains, and it is STILL placeholder copy: there is
 * no published source page for it to be copied from. It needs to be
 * replaced with the client's own text or removed from the footer.
 */
const policies: Record<string, { title: string; content: string }> = {
  "do-not-sell": {
    title: "Do Not Sell My Personal Information",
    content: `California Consumer Privacy Act (CCPA) Notice

Under the California Consumer Privacy Act (CCPA), California residents have the right to opt-out of the sale of their personal information.

Your Rights
If you are a California resident, you have the right to:
• Know what personal information we collect about you
• Know whether we sell or disclose your personal information
• Opt-out of the sale of your personal information
• Request deletion of your personal information
• Not be discriminated against for exercising your privacy rights

How to Opt-Out
To opt-out of the sale of your personal information, please contact us at:
Email: info@purple-co.com
Phone: (855) 552-6874

We will process your request within 15 business days.`,
  },
};

export default function PolicyPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const policy = policies[slug];

  if (!policy)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Page not found.</p>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-16">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6">
          <h1 className="font-condensed font-black text-5xl md:text-6xl text-white tracking-tight mb-10">
            {policy.title}
          </h1>
          <div className="prose prose-base prose-invert max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
            {policy.content}
          </div>
        </div>
      </main>
    </div>
  );
}
