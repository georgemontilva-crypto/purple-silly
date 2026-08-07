/*
 * Legal copy, reproduced VERBATIM from the client's live site
 * (https://www.purple-co.com/policies/*), fetched 2026-08-07.
 *
 * DO NOT EDIT THE WORDING. This is the text the business is bound by; it
 * is not marketing copy and it is not ours to tidy, shorten or modernise.
 * If a policy changes, re-copy it from the source rather than patching a
 * sentence here.
 *
 * Only the structure is interpreted: the source marks its section titles
 * as a one-item <ol><li>, which is reproduced here as `heading` so the
 * page can style them. Every character of every string below is the
 * client's.
 */

export type PolicyBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export interface Policy {
  slug: string;
  title: string;
  blocks: PolicyBlock[];
}

export const POLICIES: Record<string, Policy> = {
  "privacy-policy": {
    slug: "privacy-policy",
    title: "Privacy Policy",
    blocks: [
      {
        type: "paragraph",
        text: "At Purple Co, we are committed to protecting the privacy and security of your personal information. This Privacy Policy outlines how we collect, use, and disclose your information when you use our website and purchase our mushroom gummies products. By accessing our website or providing us with your information, you consent to the practices described in this Privacy Policy.",
      },
      { type: "heading", text: "Information We Collect:" },
      {
        type: "paragraph",
        text: "1.1 Personal Information: When you place an order or create an account on our website, we may collect personal information such as your name, email address, shipping address, billing address, and contact number. This information is necessary to process and fulfill your orders.",
      },
      {
        type: "paragraph",
        text: "1.2 Payment Information: In order to complete your purchase, we may collect payment information, including credit card details or other financial information. We utilize secure payment gateways to ensure the confidentiality of your payment details.",
      },
      {
        type: "paragraph",
        text: "1.3 Log Data: We automatically collect certain information when you visit our website, including your IP address, browser type, referring/exit pages, and operating system. This data is used for analytical purposes and to improve our website's functionality.",
      },
      { type: "heading", text: "Use of Information:" },
      {
        type: "paragraph",
        text: "2.1 Order Fulfillment: We use the personal information provided by you to process and fulfill your orders, including shipping, delivery, and customer support.",
      },
      {
        type: "paragraph",
        text: "2.2 Communication: We may use your email address or phone number to communicate with you regarding your orders, provide updates, and respond to your inquiries.",
      },
      {
        type: "paragraph",
        text: "2.3 Marketing: With your consent, we may send you promotional emails or newsletters about our products, special offers, or upcoming events. You can opt-out of receiving such communications at any time by following the unsubscribe instructions provided in the emails.",
      },
      { type: "heading", text: "Data Sharing and Disclosure:" },
      {
        type: "paragraph",
        text: "3.1 Service Providers: We may engage trusted third-party service providers to perform certain business functions on our behalf, such as order fulfillment, payment processing, and marketing activities. These providers have access to your personal information only to the extent necessary to perform their tasks and are obligated to maintain the confidentiality and security of your data.",
      },
      {
        type: "paragraph",
        text: "3.2 Legal Requirements: We may disclose your personal information if required to do so by law or in response to a valid request from a governmental authority, court, or law enforcement agency.",
      },
      { type: "heading", text: "Data Security:" },
      {
        type: "paragraph",
        text: "We take reasonable measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. We use industry-standard security technologies and procedures to ensure the confidentiality and integrity of your data.",
      },
      { type: "heading", text: "Third-Party Links:" },
      {
        type: "paragraph",
        text: "Our website may contain links to third-party websites. Please note that we are not responsible for the privacy practices or content of those sites. We encourage you to review the privacy policies of any third-party websites you visit.",
      },
      { type: "heading", text: "Children's Privacy:" },
      {
        type: "paragraph",
        text: "Our website and services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe that your child has provided us with personal information without your consent, please contact us, and we will take steps to delete such information from our systems.",
      },
      { type: "heading", text: "Changes to the Privacy Policy:" },
      {
        type: "paragraph",
        text: "We reserve the right to update or modify this Privacy Policy at any time. If we make any material changes, we will notify you by posting the revised version on our website or through other communication channels. The updated Privacy Policy will become effective on the date of its publication.",
      },
      { type: "heading", text: "Contact Us:" },
      {
        type: "paragraph",
        text: "If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your personal information, please contact us at customerservice@purple-co.com..",
      },
      {
        type: "paragraph",
        text: "By using our website and purchasing our products, you acknowledge that you have read and understood this Privacy Policy and agree to its terms and conditions.",
      },
    ],
  },
  "refund-policy": {
    slug: "refund-policy",
    title: "Refund Policy",
    blocks: [
      { type: "paragraph", text: "Thanks for shopping at Purple-co.com!" },
      {
        type: "paragraph",
        text: "If you are not entirely satisfied with your purchase, we are here to help.",
      },
      { type: "heading", text: "REPLACEMENTS" },
      {
        type: "paragraph",
        text: "We take customer satisfaction very seriously. Please check your Purple-co shipment carefully upon arrival to ensure it has not been damaged during shipping. All claims for damaged product(s) must be made within 3 days of receipt by writing to customerservice@purple-co.com. You will need to provide detailed information (including images) for any product damaged during shipping to be eligible for a replacement order. Refunds will not be issued for products that were damaged during shipping.",
      },
      { type: "heading", text: "RETURNS & REFUNDS" },
      {
        type: "paragraph",
        text: "You may request a refund of the full purchase price of your returned product minus shipping costs. We can only accept returns for products purchased directly from Purple-co.com. Returns and refunds must be requested within 14 days of the product received date. To be eligible for a refund the returned product must be in its original packaging, unused and unopened. The customer is responsible for return shipping. Once we receive your item, we will inspect it and notify you of the status of your refund. If your refund is approved, we will initiate a refund to your credit card (or original payment method). You will receive the credit as determined by your financial institution. Funds are usually returned within 5 – 7 business days.",
      },
      {
        type: "paragraph",
        text: "Your return request should be submitted to customerservice@purple-co.com.",
      },
      {
        type: "paragraph",
        text: "Please include the following in your return request email:",
      },
      {
        type: "list",
        items: [
          "Your order number",
          "The name on the order",
          "Telephone number",
          "Email address",
          "Your return shipping address",
          "The reason for the return",
        ],
      },
      { type: "heading", text: "EXCHANGES" },
      {
        type: "paragraph",
        text: "We do not offer exchanges for any reason so please be sure to review your order details before checking out thoroughly. If you feel that you have received the wrong product, please notify us within 48 hours of receipt at customerservice@purple-co.com.",
      },
    ],
  },
  "shipping-policy": {
    slug: "shipping-policy",
    title: "Shipping Policy",
    blocks: [
      { type: "heading", text: "SHIPMENT PROCESSING TIME" },
      {
        type: "paragraph",
        text: "All orders are processed within 1-2 business days. Orders are not shipped on weekends or major holidays.",
      },
      {
        type: "paragraph",
        text: "Shipment rates are calculated based on the weight of the package and the zip code of the delivery address. Please confirm the shipping address is accurate and complete before submitting your order. Wrong or partial addresses could result in delays or lost shipments.",
      },
      {
        type: "paragraph",
        text: "does not ship to P.O. Boxes or APO/FPO Addresses.",
      },
      { type: "heading", text: "SHIPMENT CONFIRMATION & ORDER TRACKING" },
      {
        type: "paragraph",
        text: "You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active on the UPS website within 24-48 hours.",
      },
      {
        type: "paragraph",
        text: "Delivery delays can occasionally occur. UPS does not ship on Sundays.",
      },
      { type: "heading", text: "SHIP HAPPENS" },
      {
        type: "paragraph",
        text: "If your order arrives with visible shipping damage and there is damage to your products, please contact our customer service team at customerservice@purple-co.com for a replacement order. Please save all packaging materials and damaged goods.",
      },
      {
        type: "paragraph",
        text: "Orders that are damaged during transit must be reported within three days of receipt to qualify for a replacement order. Refunds will not be issued for products that were damaged during shipping.",
      },
      { type: "heading", text: "RETURNS POLICY" },
      {
        type: "paragraph",
        text: "Our Return & Refund Policy provides detailed information about options and procedures for returning your order.",
      },
    ],
  },
  "terms-of-service": {
    slug: "terms-of-service",
    title: "Terms of Service",
    blocks: [
      {
        type: "paragraph",
        text: 'Welcome to our website! These Terms and Conditions ("Terms") govern your use of our website and any products or services offered through our website. By accessing or using our website, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our website.',
      },
      { type: "heading", text: "Intellectual Property" },
      {
        type: "paragraph",
        text: "All content on our website, including but not limited to text, graphics, logos, images, videos is the property of Purple Co or its licensors and is protected by intellectual property laws. You may not use, modify, distribute, or reproduce any content from our website without our prior written consent.",
      },
      { type: "heading", text: "Use of Our Website" },
      {
        type: "paragraph",
        text: "You may use our website for lawful purposes only. You agree not to:",
      },
      {
        type: "paragraph",
        text: "a. Use our website in any way that violates applicable laws or regulations;",
      },
      {
        type: "paragraph",
        text: "b. Engage in any unauthorized access or use of our website or its content;",
      },
      {
        type: "paragraph",
        text: "c. Collect or harvest any information from our website without our permission;",
      },
      {
        type: "paragraph",
        text: "d. Use our website to promote or engage in any illegal activities or infringe upon the rights of others.",
      },
      { type: "heading", text: "Products and Services" },
      {
        type: "paragraph",
        text: "a. Our website may offer products or services for sale. All purchases made through our website are subject to our Refund Policy. b. We reserve the right to modify, suspend, or discontinue any product or service offered on our website without prior notice. c. Prices, descriptions, and availability of products and services are subject to change without notice.",
      },
      { type: "heading", text: "User Submissions" },
      {
        type: "paragraph",
        text: "a. You may have the option to submit content, such as reviews or comments, on our website. By submitting content, you grant us a non-exclusive, royalty-free, perpetual, irrevocable, and worldwide right to use, reproduce, modify, adapt, publish, translate, distribute, and display such content in any media.",
      },
      {
        type: "paragraph",
        text: "b. You represent and warrant that you own or have the necessary rights to the content you submit and that the content is accurate, not confidential, and does not violate any third-party rights.",
      },
      {
        type: "paragraph",
        text: "c. We reserve the right to remove or modify any user-submitted content that we deem inappropriate, in violation of these Terms, or for any other reason at our sole discretion.",
      },
      { type: "heading", text: "Privacy" },
      {
        type: "paragraph",
        text: "Your privacy is important to us. Please refer to our Privacy Policy to understand how we collect, use, and protect your personal information.",
      },
      { type: "heading", text: "Links to Third-Party Websites" },
      {
        type: "paragraph",
        text: "Our website may contain links to third-party websites that are not owned or controlled by us. We are not responsible for the content, policies, or practices of these third-party websites. We encourage you to review the terms and privacy policies of any third-party websites you visit.",
      },
      { type: "heading", text: "Disclaimer of Warranties" },
      {
        type: "paragraph",
        text: 'a. Our website and its content are provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the accuracy, completeness, reliability, or availability of our website.',
      },
      {
        type: "paragraph",
        text: "b. We disclaim any warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not guarantee that our website will be error-free, secure, or uninterrupted.",
      },
      { type: "heading", text: "Limitation of Liability" },
      {
        type: "paragraph",
        text: "To the maximum extent permitted by law, we shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of or relating to your use or inability to use our website or any products or services obtained through our website.",
      },
    ],
  },
};

export const POLICY_SLUGS = Object.keys(POLICIES);
