"use client";
import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import React from "react";

const RefundAndReturnPolicyPage = () => {
  return (
    <div className="mx-auto px-4 sm:px-8 md:px-16 lg:px-32 py-8 md:py-12 text-gray-700 leading-relaxed max-w-8xl">
      <MetaTagsProvider
        title="Refund & Return Policy | SilaiGo"
        description="Understand SilaiGo's refund and return policy. While we do not offer refunds, alterations can be requested within 7 days of delivery."
      />
      <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-8 md:mb-10">
        Refund & Return Policy
      </h1>

      <p className="mb-4 text-xs sm:text-sm">
        At SILAIGO, we take immense pride in crafting garments that are tailored
        to your exact measurements and preferences. Each order is made
        individually for you, ensuring a unique fit and finish. As a result,
        **we do not offer refunds or returns** once an order is delivered.
      </p>

      <h2 className="text-base sm:text-lg font-semibold mb-2">
        Alteration Policy
      </h2>
      <p className="mb-4 text-xs sm:text-sm">
        While we do not accept returns, we understand that minor adjustments
        might be necessary to achieve the perfect fit. Therefore, we offer a
        complimentary alteration service under the following conditions:
      </p>

      <ul className="list-disc ml-4 sm:ml-6 mb-6 text-xs sm:text-sm space-y-2">
        <li>
          **Time Window:** Alteration requests must be raised within{" "}
          <strong>7 days of delivery</strong>.
        </li>
        <li>
          **Eligibility:** The garment must be unused, unwashed, and in its
          original condition.
        </li>
        <li>
          **Scope of Alterations:** Only fitting adjustments such as length,
          width, or minor stitching corrections will be accepted.
        </li>
        <li>
          **Pickup & Delivery:** We offer pickup and redelivery for alterations
          at no additional cost within our service areas.
        </li>
      </ul>

      <h2 className="text-base sm:text-lg font-semibold mb-2">
        How to Request an Alteration
      </h2>
      <p className="mb-6 text-xs sm:text-sm">
        To initiate an alteration request, please contact our support team with
        your order ID and a description of the required changes:
      </p>
      <ul className="ml-4 sm:ml-6 mb-6 text-xs sm:text-sm">
        <li>
          Email:{" "}
          <a
            href="mailto:support@silaigo.com"
            className="text-blue-600 underline"
          >
            support@silaigo.com
          </a>
        </li>
        <li>Phone: +91 88006-33755</li>
      </ul>

      <h2 className="text-base sm:text-lg font-semibold mb-2">Exceptions</h2>
      <p className="mb-6 text-xs sm:text-sm">
        Refunds or returns may be considered only in the rare case of receiving
        a damaged or incorrect item. If such an issue arises, please contact us
        within 48 hours of delivery with photos and a detailed explanation. Our
        team will review your request and respond promptly.
      </p>

      <h2 className="text-base sm:text-lg font-semibold mb-2">
        Policy Updates
      </h2>
      <p className="mb-6 text-xs sm:text-sm">
        We may update this policy from time to time. Any changes will be posted
        on this page with the revised effective date. We encourage you to review
        this policy periodically for the latest information.
      </p>

      <h2 className="text-base sm:text-lg font-semibold mb-2">Contact Us</h2>
      <div className="ml-2 sm:ml-4 text-xs sm:text-sm">
        <p className="">SILAIGO Customer Support</p>
        <p className="">
          Email:{" "}
          <a
            href="mailto:support@silaigo.com"
            className="text-blue-600 underline"
          >
            support@silaigo.com
          </a>
        </p>
        <p className="">Phone: +91 88006-33755</p>
        <p>
          Address: Shop No. 5, Lane 7, Shiva Towers, Sector 66, Noida, India
        </p>
      </div>
    </div>
  );
};

export default RefundAndReturnPolicyPage;
