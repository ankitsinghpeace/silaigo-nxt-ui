"use client";

import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import React from "react";

const termsSections = [
  {
    id: 1,
    title: "1. About SILAIGO",
    content: [
      "SILAIGO provides custom tailoring, stitching, alteration, design assistance, pickup and delivery, and related garment services.",
      "Our services may include stitching of suits, kurtis, blouses, dresses, lehengas, sharara sets, co-ord sets, ready-to-wear sarees, and other garments offered through our website or customer service channels.",
      "The availability of a particular service, design, material, location, or turnaround time may depend on the specific order.",
    ],
  },
  {
    id: 2,
    title: "2. Booking, Consultation and Order Confirmation",
    content: [
      "Customers may initially receive a tentative estimate based on the information available before pickup.",
      "The final price is determined at the time of pickup after reviewing the requested design, measurements, fabric, materials, construction requirements, and any additional services or modifications.",
      "If the requested design and scope remain consistent with the price previously discussed or agreed over a call, SILAIGO will proceed on that basis.",
      "If additional requirements or modifications are identified at pickup, the applicable additional charges will be communicated to the customer.",
      "An order will be considered confirmed once the customer accepts either the original agreed scope and price or the revised scope and price, and the pickup representative leaves the customer’s premises with the order materials.",
      "Once an order is confirmed, the applicable production and cancellation rules in these Terms will apply.",
    ],
  },
  {
    id: 3,
    title: "3. Pickup Timing",
    content: [
      "Pickup times are estimated rather than exact appointments.",
      "A variation of approximately one hour before or after the scheduled pickup time may occur due to traffic, routing, field operations, customer availability, or other practical circumstances.",
      "If SILAIGO is unable to complete the pickup within a reasonable period due to circumstances on SILAIGO’s side, the customer may reschedule or cancel the pickup without the late-cancellation fee.",
    ],
  },
  {
    id: 4,
    title: "4. Pickup Cancellation and No-Show Charges",
    content: [
      "A customer may cancel a scheduled pickup up to 4 hours before the scheduled pickup time without charge.",
      "If a pickup is cancelled less than 4 hours before the scheduled pickup time, SILAIGO may charge a ₹200 pickup cancellation charge, as the pickup representative may already have been assigned or dispatched.",
      "If the pickup representative reaches the location within the applicable pickup window but the customer is unavailable, unreachable, unable to provide the fabric, or otherwise unable to complete the handover, a ₹200 pickup failure/no-show charge may apply.",
      "Where such a charge applies, it may need to be settled before another pickup is scheduled.",
    ],
  },
  {
    id: 5,
    title: "5. Final Price at Pickup",
    content: [
      "The standard prices displayed by SILAIGO are applicable to the corresponding standard services and stated specifications.",
      "Additional charges may apply where the customer’s actual requirements differ from the standard service, including additional design work, lining, embellishments, accessories, construction requirements, alterations, or other requested additions.",
      "Where additional requirements are identified during pickup, SILAIGO will communicate the applicable revised price.",
      "If the customer does not wish to proceed with the revised requirements, the customer may choose to proceed with the original design and price previously agreed, where reasonably possible.",
      "If neither the original arrangement nor the revised arrangement is accepted by the customer, the pickup may be cancelled and a ₹200 pickup charge may apply.",
    ],
  },
  {
    id: 6,
    title: "6. Customer-Provided Fabric and Materials",
    content: [
      "Customers are responsible for providing sufficient fabric and other materials reasonably suitable for the requested garment.",
      "SILAIGO may assess the condition, quantity, suitability and characteristics of customer-provided fabric or materials.",
      "Where reasonably possible, SILAIGO may contact the customer if a material issue is identified that may materially affect the requested garment.",
      "Depending on the circumstances, SILAIGO may make reasonable adjustments or modifications necessary to complete the order, or may decline or discontinue the relevant service where completion is not reasonably possible.",
      "SILAIGO is not responsible for problems arising from inherent defects, prior damage, inadequate quantity, unsuitable characteristics, or other conditions of customer-provided materials.",
    ],
  },
  {
    id: 7,
    title: "7. Insufficient Fabric",
    content: [
      "If the supplied fabric is insufficient for the requested garment, SILAIGO may make a reasonable modification where possible.",
      "Where the issue materially affects the requested design, SILAIGO will attempt to contact the customer when reasonably practicable.",
      "If the customer cannot be reached, SILAIGO may make a reasonable modification where possible.",
      "If the requested garment cannot reasonably be completed using the available material, SILAIGO may inform the customer and return the unfinished order/material.",
    ],
  },
  {
    id: 8,
    title: "8. Customer-Provided Accessories and Special Materials",
    content: [
      "If customers provide their own lace, buttons, latkans, embellishments, lining, hooks, accessories, or other special materials, SILAIGO will use reasonable care when handling them.",
      "SILAIGO will not be responsible for defects, incompatibility, insufficiency, poor quality, or unsuitability inherent in customer-provided materials, or for resulting issues caused by those characteristics.",
    ],
  },
  {
    id: 9,
    title: "9. Design References and Inspiration Images",
    content: [
      "Customers may provide photographs, sketches, existing garments, screenshots, or other design references.",
      "Reference images are treated as design guidance rather than a guarantee of identical reproduction.",
      "SILAIGO will make reasonable efforts to achieve the requested look and design.",
      "The final garment may differ depending on the fabric, existing embroidery or embellishment, measurements, construction method, available materials, proportions, and other characteristics of the customer’s order.",
      "A design can generally be reproduced more closely where the fabric, existing work, construction and measurements are broadly similar to the reference.",
      "Exact replication of another garment or design cannot always be guaranteed.",
    ],
  },
  {
    id: 10,
    title: "10. Measurements and Fit",
    content: [
      "Customers are responsible for providing accurate information where measurements are supplied or confirmed by the customer.",
      "If alteration or correction is required because measurements supplied or confirmed by the customer were incorrect, incomplete, or inaccurate, SILAIGO may provide alteration support and applicable alteration charges may apply.",
      "If an issue is attributable to an error in measurement recording by SILAIGO or a stitching error attributable to SILAIGO, SILAIGO will provide reasonable alteration or rework without charging the customer for that correction.",
      "This does not automatically create an entitlement to a remake or refund.",
    ],
  },
  {
    id: 11,
    title: "11. Order Changes",
    content: [
      "Customers may request changes to an order before stitching begins.",
      "SILAIGO will assess whether the requested change is reasonably feasible based on the current production stage.",
      "If the change is feasible: additional charges may apply; the design, construction or materials may be revised; and the delivery timeline may change where necessary.",
      "If a requested change is no longer reasonably feasible because production has progressed, SILAIGO may decline the change and continue with the original confirmed order.",
    ],
  },
  {
    id: 12,
    title: "12. When an Order Is Considered Started",
    content: [
      "For cancellation purposes, an order is considered started when fulfilment activities have begun.",
      "This may include, without limitation: purchasing or procuring lining or other order-specific materials; purchasing accessories or other materials specifically for the order; cutting; stitching; or other material production or fulfilment activity specifically undertaken for the customer’s order.",
      "Once fulfilment has started, cancellation by the customer is generally not permitted.",
    ],
  },
  {
    id: 13,
    title: "13. Cancellation After Order Confirmation",
    content: [
      "Once an order has been confirmed but fulfilment has not yet started, the customer may request cancellation subject to a ₹200 cancellation charge.",
      "If fulfilment has already started, customer-requested cancellation is not permitted.",
      "Where a cancelled order or its materials need to be returned to the customer, SILAIGO may arrange return through Porter or another suitable delivery service, or through another reasonable method depending on the circumstances.",
      "The customer may be responsible for applicable return/delivery charges depending on the circumstances.",
    ],
  },
  {
    id: 14,
    title: "14. 48-Hour Delivery Commitment",
    content: [
      "Where a 48-hour delivery commitment applies, the 48-hour period means 48 consecutive hours, not 48 working hours.",
      "The delivery period begins once: the customer’s fabric/material has been successfully picked up; and the order has been confirmed as described in these Terms.",
      "If SILAIGO is waiting for information, clarification, measurements, approval, material, or any other action reasonably required from the customer, the affected period may not count toward the delivery commitment.",
      "The 48-hour commitment does not apply to orders or locations for which SILAIGO has specifically communicated that the commitment is unavailable.",
    ],
  },
  {
    id: 15,
    title: "15. Service Outside Normal Service Areas",
    content: [
      "SILAIGO normally provides services within its available service areas.",
      "Requests outside the normal service area may be accepted on a case-by-case basis.",
      "Where an outside-area request is accepted, the customer may be informed of any applicable additional charges or service conditions.",
      "The 48-hour delivery commitment does not apply to services accepted outside SILAIGO’s normal service area, unless SILAIGO specifically confirms otherwise.",
    ],
  },
  {
    id: 16,
    title: "16. Delays Caused by SILAIGO",
    content: [
      "If SILAIGO fails to complete an applicable 48-hour commitment due solely to circumstances within SILAIGO’s control, SILAIGO will assess the situation and may provide an appropriate resolution depending on the circumstances.",
      "No automatic discount, refund, or compensation is promised solely because a delivery exceeds the stated timeframe.",
    ],
  },
  {
    id: 17,
    title: "17. Circumstances Outside SILAIGO’s Control",
    content: [
      "SILAIGO will not be responsible for delays or inability to perform caused by circumstances beyond its reasonable control, including natural disasters, extreme weather, government restrictions, strikes, riots, major transport disruption, utility failures, widespread technical failures, or other comparable events.",
      "Where such circumstances affect an order, the relevant service or delivery timeline may be appropriately extended.",
    ],
  },
  {
    id: 18,
    title: "18. Delivery and Customer Inspection",
    content: [
      "Customers are expected to try on and inspect the garment at the time of delivery, where reasonably practicable.",
      "Any concern regarding fit, measurements, stitching, design execution, finishing, or other aspects of the garment should be raised with the delivery representative at that time.",
      "Where appropriate, the customer may hand the garment back to the delivery representative for assessment or necessary correction.",
      "Once the customer accepts the garment and completes the applicable payment, the order will ordinarily be treated as completed and accepted.",
    ],
  },
  {
    id: 19,
    title: "19. Post-Delivery Alteration Requests",
    content: [
      "Any alteration or other service requested after completion and acceptance of an order will ordinarily be treated as a new service request.",
      "Applicable alteration charges and a ₹200 pickup/collection charge may apply.",
      "However, SILAIGO may, at its discretion, consider and resolve genuine concerns on a goodwill or case-by-case basis.",
      "Nothing in this section limits any rights that cannot lawfully be excluded under applicable law.",
    ],
  },
  {
    id: 20,
    title: "20. Delivery and Payment",
    content: [
      "Payment is due after the customer has inspected/accepted the completed garment and before the delivery representative leaves, unless another arrangement has been expressly confirmed.",
      "Online payment is preferred, although cash may also be accepted where available.",
      "Applicable payment gateway or convenience charges, where relevant, will be included in the applicable final price rather than being added separately as an undisclosed charge.",
      "If a customer raises a concern during delivery and SILAIGO determines that further assessment is appropriate, SILAIGO may take the garment back for assessment or correction.",
      "If the garment has otherwise been completed in accordance with the confirmed order, refusal to accept or pay does not by itself cancel the order or create an automatic refund entitlement.",
      "SILAIGO may retain a completed garment until applicable payment obligations are settled, subject to applicable law.",
    ],
  },
  {
    id: 21,
    title: "21. Failed or Unsuccessful Delivery",
    content: [
      "If a customer is unavailable, unreachable, or otherwise unable to accept delivery, SILAIGO may determine the appropriate next step based on the circumstances.",
      "Any repeat delivery, collection, transportation, or related charges will be determined case-by-case and communicated where applicable.",
    ],
  },
  {
    id: 22,
    title: "22. Customer Fabric Lost or Materially Damaged in SILAIGO’s Custody",
    content: [
      "SILAIGO takes reasonable care when handling customer-provided materials.",
      "If customer-provided fabric or material is lost or materially damaged while in SILAIGO’s custody, SILAIGO will assess the circumstances and may provide reasonable compensation based on the verified value of the affected material, subject to reasonable supporting evidence and applicable law.",
    ],
  },
  {
    id: 23,
    title: "23. If SILAIGO Cannot Fulfil an Order",
    content: [
      "If SILAIGO determines that an order cannot reasonably be completed due to material limitations, availability issues, technical limitations, or other circumstances affecting fulfilment, SILAIGO will inform the customer where reasonably practicable.",
      "The customer’s original fabric/material will ordinarily be returned.",
      "Any tailoring charges or other amounts paid, if applicable, will be resolved appropriately based on the circumstances.",
      "The final resolution may be determined case-by-case, subject to applicable law.",
    ],
  },
  {
    id: 24,
    title: "24. Storage of Uncollected Items",
    content: [
      "If a completed garment or customer-provided material remains uncollected, undelivered, or unresolved due to customer non-acceptance, non-payment, or similar circumstances, SILAIGO may retain the item for up to 60 days.",
      "SILAIGO will make reasonable efforts to notify the customer before disposal.",
      "After the applicable 60-day period, if the customer has not collected the item or resolved the outstanding matter, SILAIGO may dispose of the item, subject to applicable law.",
    ],
  },
  {
    id: 25,
    title: "25. Promotions, Coupons and Referral Offers",
    content: [
      "Promotional offers, coupons, discounts and referral benefits are subject to their stated terms and validity.",
      "Unless expressly stated otherwise: promotional offers cannot be combined; each offer may have its own eligibility requirements; SILAIGO may modify, suspend or withdraw an offer; promotional discounts are not exchangeable for cash; and a discount or promotional benefit does not create a cash refund entitlement.",
    ],
  },
  {
    id: 26,
    title: "26. Website and Account Use",
    content: [
      "Customers are responsible for keeping their account credentials secure.",
      "Activity performed through a customer’s account may be treated as activity authorised by that customer unless the customer has notified SILAIGO of unauthorised access.",
      "SILAIGO may suspend or terminate an account where there is reasonable suspicion of fraud, misuse, unauthorised activity, abuse, violation of these Terms, or other conduct that may adversely affect SILAIGO or its customers.",
    ],
  },
  {
    id: 27,
    title: "27. Website Availability",
    content: [
      "SILAIGO does not guarantee that its website, online booking system, account services, or other digital services will always be continuously available or error-free.",
      "Temporary unavailability may occur because of maintenance, technical problems, network issues, hosting problems, third-party services, security incidents, or other circumstances.",
    ],
  },
  {
    id: 28,
    title: "28. Intellectual Property",
    content: [
      "All intellectual property relating to the SILAIGO website and platform, including its branding, logo, text, graphics, software, website design, proprietary processes, and other original content, belongs to or is lawfully used by SILAIGO.",
      "Customers may use the website and services for their intended personal purposes.",
      "Customers may not copy, reproduce, modify, distribute, commercially exploit, reverse engineer, or otherwise misuse SILAIGO’s proprietary website or brand content without appropriate permission.",
    ],
  },
  {
    id: 29,
    title: "29. Customer Information and Order Materials",
    content: [
      "SILAIGO may use information, photographs, measurements, garment images, order information and other materials provided in connection with an order for purposes connected with providing, documenting, improving, promoting, or operating SILAIGO’s services, subject to applicable law and SILAIGO’s Privacy Policy.",
      "SILAIGO will handle personal information in accordance with its Privacy Policy and applicable law.",
    ],
  },
  {
    id: 30,
    title: "30. Right to Refuse or Suspend Service",
    content: [
      "SILAIGO may refuse, suspend, cancel, or discontinue a service or order where reasonably necessary, including circumstances involving: abusive or threatening behaviour; suspected fraud or misuse; repeated non-payment; unsafe working or pickup/delivery conditions; unlawful requests; inability to reasonably fulfil the requested service; misuse of SILAIGO’s systems or services; or other circumstances where continuing the service would be unreasonable or impracticable.",
      "Where appropriate, SILAIGO will communicate the reason or next steps to the customer.",
    ],
  },
  {
    id: 31,
    title: "31. Limitation of Liability",
    content: [
      "SILAIGO will take reasonable care in providing its services.",
      "To the extent permitted by applicable law, SILAIGO will not be responsible for indirect, incidental, special, consequential, or purely economic losses arising from the use of its services where such losses were not reasonably foreseeable.",
      "This limitation does not exclude or restrict liability that cannot legally be excluded or restricted, including liability arising from proven negligence, wilful misconduct, or other circumstances where limitation is prohibited by law.",
      "Nothing in these Terms is intended to remove or restrict mandatory rights available to consumers under applicable law.",
    ],
  },
  {
    id: 32,
    title: "32. Privacy",
    content: [
      "Use of personal information is governed by SILAIGO’s Privacy Policy.",
      "The Privacy Policy explains how SILAIGO may collect, use, store, and process information required to provide its services and operate its website.",
    ],
  },
  {
    id: 33,
    title: "33. Governing Law and Dispute Resolution",
    content: [
      "These Terms are governed by the laws of India.",
      "If a customer has a concern or dispute, the customer is encouraged to first contact SILAIGO so that the matter can be reviewed and, where possible, resolved directly.",
      "Nothing in this section prevents a customer from exercising any legal or consumer rights available under applicable law.",
      "Subject to applicable law, courts in Noida, Uttar Pradesh shall have jurisdiction over disputes arising from these Terms or SILAIGO’s services.",
    ],
  },
  {
    id: 34,
    title: "34. Changes to These Terms",
    content: [
      "SILAIGO may update these Terms from time to time.",
      "The updated version will be published on the SILAIGO website.",
      "The revised Terms will generally apply to future orders and service transactions made after the updated Terms are published.",
      "The Terms applicable to an existing order will ordinarily be those in effect when that order was confirmed, unless a change is required by law.",
    ],
  },
  {
    id: 35,
    title: "35. Severability",
    content: [
      "If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue to apply to the extent permitted by law.",
    ],
  },
  {
    id: 36,
    title: "36. Contact and Grievances",
    content: [
      "For questions, complaints, order-related concerns, or other matters relating to these Terms, customers may contact SILAIGO:",
      "Email: Silaigo.official@gmail.com",
      "Phone: +91 88006-33755",
      "SILAIGO will make reasonable efforts to review and respond to customer concerns.",
    ],
  },
];

export default function TermsAndConditionPage() {
  return (
    <div className="mx-auto px-4 sm:px-8 md:px-16 lg:px-32 py-8 md:py-12 text-gray-700 leading-relaxed max-w-6xl">
      <MetaTagsProvider
        title="Terms & Conditions | SILAIGO"
        description="SILAIGO Terms & Conditions. Learn about our policies, guidelines, order confirmation, pickup, and tailoring services."
      />
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          SILAIGO Terms & Conditions
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          Effective Date: 8 September 2026
        </p>
      </div>

      <div className="bg-primary/5 rounded-xl p-4 sm:p-6 mb-8 text-xs sm:text-sm text-gray-700 leading-relaxed border border-primary/20">
        <p className="mb-2">
          These Terms & Conditions govern the use of SILAIGO’s website, tailoring services, pickup and delivery services, consultations, and related services.
        </p>
        <p className="font-medium text-gray-900">
          By booking a pickup, placing an order, using our website, or otherwise using SILAIGO’s services, you agree to these Terms & Conditions.
        </p>
      </div>

      <div className="space-y-8">
        {termsSections.map((section) => (
          <div key={section.id} className="border-b border-gray-100 pb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.content.map((paragraph, index) => (
                <p key={index} className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
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
