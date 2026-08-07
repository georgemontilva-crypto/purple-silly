import { useParams } from "wouter";

const policies: Record<string, { title: string; content: string }> = {
  "privacy-policy": {
    title: "Privacy Policy",
    content: `We respect the privacy of adult consumers. Listed below is our privacy policy. It applies to the information we collect on this website. This site is operated, in whole or in part, from the United States. By using this site, regardless of where you live in the world, you consent to have any personal information you provide transferred to and processed in the United States, and allow us to use and collect your personal information in accordance with this Policy.

Adult Audience
We restrict our marketing mailing list to individuals who have certified that (1) they are consumers 21 years of age or older, (2) they want to be added to our contact list in order to receive content, offers, and advertising from a company, and (3) they understand that providing false information may constitute fraud.

Information We Collect
We collect information you provide directly to us, such as when you create an account, make a purchase, subscribe to our newsletter, or contact us for support. This may include your name, email address, postal address, phone number, and payment information.

How We Use Your Information
We use the information we collect to process transactions, send transactional and promotional communications, respond to your comments and questions, and improve our services.

Contact Us
If you have questions about this Privacy Policy, please contact us at info@purple-co.com.`,
  },
  "terms-and-conditions": {
    title: "Terms and Conditions",
    content: `Terms of Use Agreement

These terms of service (TOS) govern your utilization of our website, which is provided by our company. By accessing this site, you are denoting your acknowledgment and acceptance of these terms. These terms are subject to change by our business at any time at its discretion. Your utilization of this site after we implement such changes constitutes your acknowledgment and acceptance of the terms.

Age Restriction
You must be at least 21 years of age to purchase products from this website. By placing an order, you certify that you are at least 21 years of age.

Intellectual Property
All content on this website, including text, graphics, logos, and images, is the property of Purple Organics and is protected by applicable intellectual property laws.

Limitation of Liability
Purple Organics shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our products or services.

Contact Us
For questions regarding these Terms and Conditions, please contact us at info@purple-co.com.`,
  },
  "shipping-information": {
    title: "Shipping Information",
    content: `Processing Time
At Purple Organics, we work hard to process your order as quickly as possible. In some instances, processing time can take up to 72 hours. Please allow up to 72 hours to receive your package(s) tracking information.

Shipping Methods
The following shipping methods are available:
• Free Shipping on orders $75+ (5–8 business days)
• First Class Mail (3–5 business days)
• Priority Mail (1–3 business days)
• FedEx (2 business days)

IMPORTANT: Please be advised that all suggested delivery times are estimated and NOT GUARANTEED. Shipping charges are NON-REFUNDABLE.

Business Days
Business days are Monday through Friday, excluding federal holidays. Orders placed on weekends or holidays will be processed the next business day.

International Shipping
At this time, we only ship within the United States.`,
  },
  "refund-return-policy": {
    title: "Refund & Return Policy",
    content: `Thank you for your purchase. Please read the following policies regarding product returns, exchanges, and refunds carefully.

Return Policy
You may return unopened products in original packaging within 60 days from the date which the order was placed, for a refund of the purchase price. Only qualified, unopened, unused items that are in the original packaging may be returned for a refund.

Return Processing
In order to return a product, you must contact us by emailing info@purple-co.com and submitting a return merchandise authorization (RMA) request. If the item is damaged or defective, please include photos with your request.

Refund Timeline
Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed within 5–10 business days to your original payment method.

Contact Us
For return inquiries, please email info@purple-co.com.`,
  },
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
