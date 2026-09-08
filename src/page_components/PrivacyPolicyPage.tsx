"use client";

import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import React from "react";

const privacySections = [
  {
    id: 1,
    title: "1. Information We May Collect",
    subsections: [
      {
        subtitle: "Personal and Contact Information",
        bullets: [
          "Name",
          "Mobile number",
          "Email address",
          "Delivery and pickup address",
          "Other contact details provided by you",
        ],
      },
      {
        subtitle: "Tailoring and Order Information",
        intro: "To provide customised tailoring services, we may collect information such as:",
        bullets: [
          "Body measurements",
          "Garment measurements",
          "Size and fitting preferences",
          "Garment and design requirements",
          "Fabric and material details",
          "Photographs or reference images provided by you",
          "Order history",
          "Alteration requirements",
          "Other information necessary to fulfil your order",
        ],
      },
      {
        subtitle: "Payment Information",
        text: "When you make a payment, relevant payment information may be processed through our payment service providers. Where payment processing is handled by a third-party payment gateway, SILAIGO does not ordinarily need to store your complete card or banking credentials.",
      },
      {
        subtitle: "Website and Technical Information",
        intro: "When you use our website, certain technical information may be collected automatically, such as:",
        bullets: [
          "IP address",
          "Browser and device information",
          "Operating system",
          "Approximate location information",
          "Pages visited and referring pages",
          "Interaction and usage information",
          "Cookies and similar technologies",
          "Technical logs necessary for security and operation",
        ],
      },
    ],
  },
  {
    id: 2,
    title: "2. How We Use Your Information",
    intro: "SILAIGO may use personal information for purposes including:",
    bullets: [
      "Creating and managing orders",
      "Arranging pickup and delivery",
      "Understanding measurements and tailoring requirements",
      "Communicating regarding an order",
      "Providing customer support",
      "Processing payments",
      "Handling alterations and complaints",
      "Providing invoices, order summaries and service updates",
      "Improving our products, services and website",
      "Maintaining security and preventing fraud or misuse",
      "Maintaining business and operational records",
      "Analysing website and service performance",
      "Complying with applicable legal obligations",
    ],
  },
  {
    id: 3,
    title: "3. Order-Related Communications",
    text: "SILAIGO may use the contact information provided by a customer to communicate about an order or requested service. These communications may include information relating to pickup scheduling, order confirmation, order details, pricing, invoices and payment, production status, dispatch, delivery, alterations, and other information necessary to provide the requested service.",
  },
  {
    id: 4,
    title: "4. Marketing Communications",
    text: "SILAIGO may use personal information for promotional or marketing communications where permitted by applicable law and based on the applicable consent or legal basis. Customers may request to stop receiving promotional communications. Stopping promotional communications will not normally affect essential communications required to fulfil an existing order or provide requested services.",
  },
  {
    id: 5,
    title: "5. Sharing of Information",
    intro: "SILAIGO may share relevant information with service providers or other parties where reasonably necessary to operate the business and provide requested services. Depending on the service, these parties may include:",
    bullets: [
      "Pickup and delivery partners",
      "Tailoring and production personnel",
      "Payment gateways and payment service providers",
      "Website hosting and infrastructure providers",
      "Analytics and technology providers",
      "Customer support or communication providers",
      "Professional advisers",
      "Government, regulatory, law-enforcement, or other authorities where required or permitted by law",
    ],
    outro: "SILAIGO aims to share only information reasonably necessary for the relevant purpose.",
  },
  {
    id: 6,
    title: "6. Customer Measurements and Tailoring Information",
    text: "Because SILAIGO provides customised tailoring, measurements and garment-related information may need to be accessed by relevant personnel involved in fulfilling an order. Such information is used for operational purposes such as cutting, stitching, quality checking, alteration, delivery, and customer support. Access to order information should be limited to what is reasonably required for the relevant task.",
  },
  {
    id: 7,
    title: "7. Photographs and Order Images",
    text: "Customers may provide photographs, reference images, garment photographs, or other visual material in connection with an order. SILAIGO may use such material for purposes connected with providing and documenting the service. Where permitted, SILAIGO may also use suitable order-related photographs, garment images, customer-submitted content, or other visual material for business promotion, marketing, website content, social media, portfolio purposes, or demonstrating its work. SILAIGO will handle personal information in accordance with applicable law.",
  },
  {
    id: 8,
    title: "8. Cookies and Similar Technologies",
    intro: "SILAIGO may use cookies, analytics tools, pixels, tags, and similar technologies to operate the website, remember preferences, understand website usage, measure performance, improve user experience, maintain security, and support relevant marketing or analytics activities where applicable.",
    outro: "Users may be able to control certain cookies through browser or device settings. Disabling certain cookies may affect some website functionality.",
  },
  {
    id: 9,
    title: "9. Analytics and Advertising",
    text: "SILAIGO may use analytics and advertising technologies to understand website traffic, campaign performance, customer behaviour, and service usage. Where third-party advertising or analytics providers are used, those providers may process certain technical or usage information according to their own policies and applicable requirements.",
  },
  {
    id: 10,
    title: "10. Data Security",
    text: "SILAIGO takes reasonable measures designed to protect personal information against unauthorised access, misuse, alteration, disclosure, or loss. However, no internet transmission or electronic storage system can be guaranteed to be completely secure. Customers should also take reasonable precautions to protect their account credentials and devices.",
  },
  {
    id: 11,
    title: "11. Data Retention",
    intro: "SILAIGO may retain personal information for as long as reasonably necessary for the purposes for which it was collected, including fulfilling and maintaining order records, customer support, accounting and financial records, handling disputes or complaints, security and fraud prevention, legal and regulatory obligations, and legitimate business purposes.",
    outro: "When information is no longer reasonably required and there is no legal or operational reason to retain it, SILAIGO may delete, anonymise, or otherwise appropriately dispose of it. Specific retention periods may vary depending on the type and purpose of the information.",
  },
  {
    id: 12,
    title: "12. Your Choices and Rights",
    intro: "Depending on applicable law and the stage of implementation of relevant legal provisions, individuals may have rights relating to their personal data, including rights to:",
    bullets: [
      "Obtain information about processing",
      "Request access to personal information",
      "Request correction of inaccurate information",
      "Request deletion where applicable",
      "Withdraw consent where processing is based on consent",
      "Opt out of promotional communications",
      "Raise a complaint regarding personal-data processing",
    ],
    outro: "Requests will be handled in accordance with applicable law and may be subject to reasonable verification requirements. Certain information may need to be retained where required by law or where necessary for legitimate business or legal purposes.",
  },
  {
    id: 13,
    title: "13. Withdrawal of Consent",
    text: "Where processing is based on consent, a customer may withdraw consent using a reasonably accessible method provided by SILAIGO. Withdrawal of consent does not affect processing that was lawfully carried out before withdrawal. Withdrawal may also affect SILAIGO’s ability to provide certain services where the information is necessary to provide those services.",
  },
  {
    id: 14,
    title: "14. Third-Party Websites and Services",
    text: "SILAIGO may use or link to third-party services, payment providers, social-media platforms, analytics providers, or other external websites. SILAIGO is not responsible for the privacy practices of third-party websites or services. Customers should review the privacy policies of the relevant third parties when using their services.",
  },
  {
    id: 15,
    title: "15. Children’s Information",
    text: "SILAIGO’s services are intended for users who can lawfully enter into agreements and provide the information necessary for the requested service. Where applicable law requires parental or guardian involvement for processing a minor’s personal information, SILAIGO will follow the applicable requirements.",
  },
  {
    id: 16,
    title: "16. Changes to This Privacy Policy",
    text: "SILAIGO may update this Privacy Policy from time to time. The updated version will be published on the SILAIGO website. Changes will generally apply from the date the revised Policy is published, subject to applicable law.",
  },
  {
    id: 17,
    title: "17. Contact and Privacy Requests",
    text: "For questions, privacy concerns, requests relating to personal information, or complaints regarding this Privacy Policy:",
    contact: [
      "Email: Silaigo.official@gmail.com",
      "Phone: +91 88006-33755",
    ],
    outro: "SILAIGO will make reasonable efforts to review and respond to privacy-related requests in accordance with applicable law.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto px-4 sm:px-8 md:px-16 lg:px-32 py-8 md:py-12 text-gray-700 leading-relaxed max-w-6xl">
      <MetaTagsProvider
        title="Privacy Policy | SILAIGO"
        description="SILAIGO Privacy Policy. Learn what information we collect, how it is used, shared, and your privacy choices."
      />
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          SILAIGO Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          Effective Date: 8 September 2026
        </p>
      </div>

      <div className="bg-primary/5 rounded-xl p-4 sm:p-6 mb-8 text-xs sm:text-sm text-gray-700 leading-relaxed border border-primary/20 space-y-2">
        <p>
          SILAIGO respects the privacy of its customers and users.
        </p>
        <p>
          This Privacy Policy explains what information SILAIGO may collect, why it is collected, how it may be used, when it may be shared, and the choices available to customers.
        </p>
        <p className="font-medium text-gray-900">
          SILAIGO aims to handle personal information responsibly and transparently and will process personal data in accordance with applicable law, including applicable requirements under India’s digital personal data protection framework as and when the relevant provisions apply.
        </p>
      </div>

      <div className="space-y-8">
        {privacySections.map((section) => (
          <div key={section.id} className="border-b border-gray-100 pb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
              {section.title}
            </h2>

            {section.text && (
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-2">
                {section.text}
              </p>
            )}

            {section.intro && (
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-2">
                {section.intro}
              </p>
            )}

            {section.bullets && (
              <ul className="list-disc list-inside text-xs sm:text-sm text-gray-700 space-y-1 mb-2 pl-2">
                {section.bullets.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            )}

            {section.subsections && (
              <div className="space-y-4 mt-3 pl-2">
                {section.subsections.map((sub, sIdx) => (
                  <div key={sIdx}>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                      {sub.subtitle}
                    </h3>
                    {sub.text && (
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-2">
                        {sub.text}
                      </p>
                    )}
                    {sub.intro && (
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-1">
                        {sub.intro}
                      </p>
                    )}
                    {sub.bullets && (
                      <ul className="list-disc list-inside text-xs sm:text-sm text-gray-700 space-y-1 pl-2">
                        {sub.bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.contact && (
              <div className="bg-gray-50 rounded-lg p-3 my-2 text-xs sm:text-sm font-medium text-gray-800 space-y-1 border">
                {section.contact.map((cLine, cIdx) => (
                  <p key={cIdx}>{cLine}</p>
                ))}
              </div>
            )}

            {section.outro && (
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mt-2">
                {section.outro}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 text-center text-xs sm:text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-gray-900 text-base">SILAIGO</p>
        <p className="text-gray-600">Personalized tailoring with doorstep convenience.</p>
        <p className="text-gray-400 text-xs mt-2">Effective Date: 8 September 2026</p>
      </div>
    </div>
  );
}
