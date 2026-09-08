"use client";

import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import React from "react";

const refundSections = [
  {
    id: 1,
    title: "1. Custom-Made Orders",
    content: [
      "Tailoring orders are generally customised for the individual customer and are therefore not eligible for a standard return simply because the customer changes their mind, no longer wants the garment, or does not prefer the final design after accepting the order.",
      "This does not affect any rights or remedies that cannot legally be excluded under applicable law.",
    ],
  },
  {
    id: 2,
    title: "2. Inspection at Delivery",
    intro: "Customers are encouraged to try on and inspect the garment at the time of delivery, where reasonably practicable. Customers should raise concerns regarding:",
    bullets: [
      "Fit or measurements",
      "Stitching",
      "Design execution",
      "Finishing",
      "Visible damage",
      "Other apparent issues",
    ],
    outro: "with the delivery representative at the time of delivery. Where appropriate, the garment may be handed back to the delivery representative for assessment or correction.",
  },
  {
    id: 3,
    title: "3. Alteration Due to SILAIGO Error",
    content: [
      "If an issue is attributable to a measurement-recording error by SILAIGO or a stitching error attributable to SILAIGO, SILAIGO will provide reasonable alteration or rework without charging the customer for that correction.",
      "The appropriate correction will depend on the nature of the issue.",
      "A correction does not automatically mean that the garment will be remade or that a refund will be issued.",
    ],
  },
  {
    id: 4,
    title: "4. Alteration Due to Customer-Provided Measurements",
    content: [
      "Where an alteration is required because the customer supplied or confirmed incorrect, incomplete, or inaccurate measurements, SILAIGO may provide alteration services subject to applicable alteration charges.",
    ],
  },
  {
    id: 5,
    title: "5. Post-Delivery Concerns",
    content: [
      "Once a customer has inspected and accepted the garment and completed the applicable payment, the order will ordinarily be treated as completed and accepted.",
      "If the customer later reports an issue, SILAIGO may treat the request as a new alteration or service request.",
      "Applicable alteration charges and a ₹200 pickup/collection charge may apply.",
      "However, SILAIGO may, at its discretion, review genuine concerns and provide a goodwill or case-by-case resolution.",
    ],
  },
  {
    id: 6,
    title: "6. Design Differences",
    content: [
      "Reference images, photographs, sketches and existing garments are treated as design guidance.",
      "SILAIGO makes reasonable efforts to achieve the requested appearance, but an exact reproduction cannot always be guaranteed.",
      "Differences may result from the customer’s fabric, existing embroidery or embellishment, measurements, construction requirements, material availability, or other characteristics of the order.",
      "A difference from a reference image alone does not automatically qualify an order for a refund.",
    ],
  },
  {
    id: 7,
    title: "7. Customer-Provided Fabric and Materials",
    intro: "SILAIGO takes reasonable care while handling customer-provided fabric and materials. SILAIGO is not responsible for issues arising from:",
    bullets: [
      "Pre-existing damage",
      "Inherent fabric defects",
      "Insufficient fabric",
      "Unsuitable fabric characteristics",
      "Incompatible materials",
      "Defective customer-provided accessories",
      "Other conditions inherent in materials supplied by the customer",
    ],
    outro: "Where insufficient fabric or another material issue prevents the requested garment from being reasonably completed, SILAIGO may make a reasonable modification where possible or inform the customer and return the unfinished material/order.",
  },
  {
    id: 8,
    title: "8. Loss or Material Damage While in SILAIGO’s Custody",
    content: [
      "If customer-provided fabric or material is lost or materially damaged while in SILAIGO’s custody, SILAIGO will assess the circumstances.",
      "Where appropriate, SILAIGO may provide reasonable compensation based on the verified value of the affected material, subject to reasonable supporting evidence and applicable law.",
    ],
  },
  {
    id: 9,
    title: "9. When SILAIGO Cannot Complete an Order",
    content: [
      "If SILAIGO cannot reasonably complete an order because of material limitations, availability issues, technical limitations, or other circumstances affecting fulfilment, SILAIGO will inform the customer where reasonably practicable.",
      "The customer’s original fabric/material will ordinarily be returned.",
      "Any tailoring charges or other amounts already paid will be resolved appropriately based on the circumstances.",
      "The final resolution may be determined on a case-by-case basis, subject to applicable law.",
    ],
  },
  {
    id: 10,
    title: "10. Cancellation Before Fulfilment Starts",
    content: [
      "A confirmed order may be cancelled by the customer only if fulfilment has not yet started.",
      "A ₹200 cancellation charge may apply.",
      "If the order has already entered fulfilment, cancellation is generally not permitted because materials, labour or other resources may already have been committed specifically to the order.",
      "For the purpose of cancellation, fulfilment may be considered started when SILAIGO has begun order-specific activities such as purchasing/procuring lining or other materials, cutting, stitching, or other material production activity.",
    ],
  },
  {
    id: 11,
    title: "11. Return of Customer Materials After Cancellation",
    content: [
      "Where an order is cancelled or cannot be completed, customer fabric/material may be returned through an appropriate method depending on the circumstances.",
      "Return arrangements and any applicable transportation or delivery charges will be determined case-by-case.",
      "Where a third-party delivery service such as Porter is used, applicable transportation charges may be payable by the customer depending on the circumstances.",
    ],
  },
  {
    id: 12,
    title: "12. Delivery Refusal or Failed Delivery",
    content: [
      "If a customer is unavailable, unreachable, or otherwise unable to accept a completed order, SILAIGO may determine the appropriate next step based on the circumstances.",
      "Any repeat delivery, collection, transportation or related charges will be determined case-by-case and communicated where applicable.",
    ],
  },
  {
    id: 13,
    title: "13. Uncollected Garments and Materials",
    content: [
      "Completed garments or customer-provided materials may be retained for up to 60 days where they remain uncollected, undelivered, unresolved, or subject to outstanding payment.",
      "SILAIGO will make reasonable efforts to notify the customer before disposal.",
      "After the applicable 60-day period, SILAIGO may dispose of uncollected items, subject to applicable law.",
    ],
  },
  {
    id: 14,
    title: "14. Refund Processing",
    content: [
      "Where a refund is determined to be appropriate, it will generally be processed through the original payment method or another reasonable method agreed with the customer.",
      "The timing of the refund may depend on the payment method, banking system, payment gateway, or other third-party processing timelines.",
    ],
  },
  {
    id: 15,
    title: "15. Promotional Discounts and Coupons",
    intro: "Promotional discounts, coupons and referral benefits are subject to their specific terms. Unless expressly stated otherwise:",
    bullets: [
      "Offers cannot be combined",
      "Promotional benefits are subject to eligibility and validity conditions",
      "Promotional offers may be modified or withdrawn",
      "Discounts are not exchangeable for cash",
      "A promotional discount does not independently create a cash refund entitlement",
    ],
  },
  {
    id: 16,
    title: "16. Contact Us",
    intro: "For return, refund, alteration, or order-related concerns:",
    contact: [
      "Email: Silaigo.official@gmail.com",
      "Phone: +91 88006-33755",
    ],
    outro: "SILAIGO will make reasonable efforts to review customer concerns and provide an appropriate resolution in accordance with this Policy, the applicable order terms, and applicable law.",
  },
];

export default function RefundAndReturnPolicyPage() {
  return (
    <div className="mx-auto px-4 sm:px-8 md:px-16 lg:px-32 py-8 md:py-12 text-gray-700 leading-relaxed max-w-6xl">
      <MetaTagsProvider
        title="Return & Refund Policy | SILAIGO"
        description="SILAIGO Return & Refund Policy. Learn about custom-made orders, alterations, delivery inspections, cancellations, and material handling."
      />
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          SILAIGO Return & Refund Policy
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          Effective Date: 8 September 2026
        </p>
      </div>

      <div className="bg-primary/5 rounded-xl p-4 sm:p-6 mb-8 text-xs sm:text-sm text-gray-700 leading-relaxed border border-primary/20 space-y-2">
        <p>
          SILAIGO provides customised tailoring and garment-making services using customer-provided fabrics and materials. Because most orders are made specifically according to the customer’s requirements, measurements, fabric, design and selected specifications, returns and refunds are handled differently from standard ready-made retail products.
        </p>
        <p className="font-medium text-gray-900">
          Our objective is to provide a fair and practical resolution where a genuine issue arises while recognising the customised nature of the service.
        </p>
      </div>

      <div className="space-y-8">
        {refundSections.map((section) => (
          <div key={section.id} className="border-b border-gray-100 pb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
              {section.title}
            </h2>

            {section.content && (
              <div className="space-y-2">
                {section.content.map((paragraph, index) => (
                  <p key={index} className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
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
