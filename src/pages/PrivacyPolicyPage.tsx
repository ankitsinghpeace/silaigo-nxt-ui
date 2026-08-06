import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="mx-auto px-4 sm:px-8 md:px-16 lg:px-32 py-8 md:py-12 text-gray-700 leading-relaxed max-w-8xl">
      <MetaTagsProvider
        title="Privacy Policy | SilaiGo"
        description="Privacy Policy for SilaiGo. Learn how we collect, use, and protect your personal information."
      />
      <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-8 md:mb-10">
        Privacy Policy
      </h1>
      <p className="mb-4 text-xs sm:text-sm">
        SILAIGO (“we”, “our”, or “us”) respects your privacy and is committed to
        protecting your personal data. This Privacy Policy explains how we
        collect, use, disclose, and safeguard your information when you visit
        our website{" "}
        <a href="https://silaigo.com" className="text-blue-600 underline">
          https://silaigo.com
        </a>{" "}
        and use our tailoring services, including fabric pickup, doorstep
        delivery, and online customization.
      </p>
      <p className="mb-6 text-xs sm:text-sm">
        By using our website or services, you agree to the terms of this Privacy
        Policy.
      </p>

      <h2 className="text-base sm:text-lg font-semibold mb-2">1. Information We Collect</h2>
      <h3 className="text-sm sm:text-base font-medium mb-2">A. Personal Information</h3>
      <ul className="list-disc ml-4 sm:ml-6 mb-4 text-xs sm:text-sm space-y-2">
        <li>
          <strong>Contact Information:</strong> We collect your name, email
          address, phone number, and physical address to communicate with you
          regarding your orders, provide updates, and deliver our services
          efficiently.
        </li>
        <li>
          <strong>Measurement Details:</strong> Your body measurements, either
          provided by you online or collected during doorstep visits, are used
          solely to ensure the accuracy and fit of your tailored garments.
        </li>
        <li>
          <strong>Order Information:</strong> We keep records of your garment
          preferences, customization options, and order history to personalize
          your experience and streamline repeat orders.
        </li>
        <li>
          <strong>Account Data:</strong> If you create an account, we store your
          username, password (securely hashed), and account preferences to
          facilitate secure access and a personalized experience.
        </li>
        <li>
          <strong>Payment Information:</strong> Payment details such as UPI or
          credit/debit card information are processed securely via trusted
          third-party payment processors. We do not store your full payment
          details on our servers.
        </li>
      </ul>
      <h3 className="text-sm sm:text-base font-medium mb-2">
        B. Automatically Collected Information
      </h3>
      <ul className="list-disc ml-4 sm:ml-6 mb-6 text-xs sm:text-sm space-y-2">
        <li>
          <strong>Device Information:</strong> We automatically collect
          information about the device you use to access our website, such as
          browser type, operating system, and IP address, to optimize site
          performance and security.
        </li>
        <li>
          <strong>Location:</strong> We may determine your approximate location
          based on your IP address to provide region-specific services and
          offers.
        </li>
        <li>
          <strong>Log Data:</strong> We collect data on the pages you visit, the
          time spent on each page, and your clickstream activity to analyze
          usage patterns and improve our website.
        </li>
        <li>
          <strong>Cookies and Usage Tracking Data:</strong> Cookies and similar
          technologies help us remember your preferences, track your activity,
          and enhance your browsing experience.
        </li>
      </ul>

      <h2 className="text-base sm:text-lg font-semibold mb-2">
        2. How We Use Your Information
      </h2>
      <ul className="list-disc ml-4 sm:ml-6 mb-6 text-xs sm:text-sm space-y-2">
        <li>
          <strong>Fulfilling tailoring orders and managing logistics:</strong>{" "}
          Your information is used to process your tailoring requests,
          coordinate fabric pickup, manage stitching, and arrange doorstep
          delivery.
        </li>
        <li>
          <strong>Customer service and order updates:</strong> We use your
          contact details to provide support, answer queries, and keep you
          informed about your order status.
        </li>
        <li>
          <strong>Improving website UX and performance:</strong> Usage data
          helps us identify areas for improvement, fix bugs, and enhance the
          overall user experience.
        </li>
        <li>
          <strong>Sending promotional offers and updates:</strong> With your
          consent, we may send you emails or messages about new services,
          discounts, or special offers.
        </li>
        <li>
          <strong>Internal analytics and business development:</strong>{" "}
          Aggregated data is analyzed to understand customer preferences,
          improve our offerings, and guide business decisions.
        </li>
        <li>
          <strong>Ensuring platform security and fraud prevention:</strong> We
          monitor activity to detect and prevent unauthorized access, fraud, or
          other security threats.
        </li>
      </ul>

      <h2 className="text-base sm:text-lg font-semibold mb-2">
        3. How We Share Your Information
      </h2>
      <p className="text-xs sm:text-sm ml-2 sm:ml-6 mb-2">
        We do not sell your personal information. We may share data with:
      </p>
      <ul className="list-disc ml-4 sm:ml-6 mb-6 text-xs sm:text-sm space-y-2">
        <li>
          <strong>Delivery Partners:</strong> Your name, address, and contact
          number may be shared with trusted delivery partners to facilitate
          fabric collection and order delivery.
        </li>
        <li>
          <strong>Tailoring Teams:</strong> Measurement details and garment
          preferences are shared with our tailoring staff to fulfill your
          customization requests accurately.
        </li>
        <li>
          <strong>Payment Gateways:</strong> Payment information is securely
          transmitted to third-party payment processors for transaction
          completion. We do not retain your full payment details.
        </li>
        <li>
          <strong>Marketing Tools:</strong> With your consent, your email may be
          used with marketing platforms to send you updates and promotional
          content.
        </li>
        <li>
          <strong>Legal Authorities:</strong> We may disclose your information
          if required by law, regulation, or to protect our rights and enforce
          our policies.
        </li>
      </ul>

      <h2 className="text-base sm:text-lg font-semibold mb-2">4. Data Retention</h2>
      <p className="mb-6 ml-2 sm:ml-4 text-xs sm:text-sm">
        We retain your personal information only as long for:
      </p>
      <ul className="list-disc ml-4 sm:ml-6 mb-6 text-xs sm:text-sm space-y-2">
        <li>
          <strong>Order fulfillment and service history:</strong> We retain your data to ensure accurate processing of current and future orders, maintain a record of your service history, and provide a seamless tailoring experience.
        </li>
        <li>
          <strong>Legal and compliance obligations:</strong> Your information may be retained as required to comply with applicable laws, regulations, and to respond to lawful requests from authorities.
        </li>
        <li>
          <strong>User support and troubleshooting:</strong> Retaining relevant data enables us to assist you with inquiries, resolve issues, and improve our customer support services.
        </li>
        <li>
          <strong>Data deletion requests:</strong> You may request deletion of your personal data at any time (see Section 8 for details on exercising your rights).
        </li>
      </ul>

      <h2 className="text-base sm:text-lg font-semibold mb-2">5. Cookies and Tracking</h2>
      <p className="mb-6 ml-2 sm:ml-4 text-xs sm:text-sm">
        Our website uses cookies and similar technologies to remember your
        preferences, analyze site traffic, and personalize your experience. You
        can manage or disable cookies through your browser settings, but some
        features may not function properly if cookies are disabled.
      </p>

      <h2 className="text-base sm:text-lg font-semibold mb-2">6. Data Security</h2>
      <p className="mb-6 ml-2 sm:ml-4 text-xs sm:text-sm">
        We implement industry-standard security measures such as SSL encryption,
        secure servers, and restricted access controls to protect your data.
        While we strive to safeguard your information, no system can guarantee
        absolute security.
      </p>

      <h2 className="text-base sm:text-lg font-semibold mb-2">7. Children’s Privacy</h2>
      <p className="mb-6 ml-2 sm:ml-4 text-xs sm:text-sm">
        Our services are not intended for children under 13. We do not knowingly
        collect personal data from children. If we become aware of such data, we
        will promptly delete it from our records.
      </p>

      <h2 className="text-base sm:text-lg font-semibold mb-2">8. Your Rights</h2>
      <ul className="list-disc ml-4 sm:ml-6 mb-6 text-xs sm:text-sm space-y-2">
        <li>
          <strong>Access your personal data:</strong> You can request a copy of
          the personal information we hold about you.
        </li>
        <li>
          <strong>Correct inaccuracies:</strong> You may ask us to update or
          correct any inaccurate or incomplete data.
        </li>
        <li>
          <strong>Request deletion:</strong> You have the right to request
          deletion of your personal data, subject to legal or contractual
          obligations.
        </li>
        <li>
          <strong>Withdraw consent for marketing:</strong> You can opt out of
          receiving marketing communications at any time.
        </li>
        <li>
          <strong>Request a copy of stored data:</strong> You may request an
          export of your data in a commonly used format.
        </li>
      </ul>
      <p className="mb-6 text-xs sm:text-sm">
        To exercise your rights, please contact us at{" "}
        <a
          href="mailto:support@silaigo.com"
          className="text-blue-600 underline"
        >
          support@silaigo.com
        </a>
        .
      </p>

      <h2 className="text-base sm:text-lg font-semibold mb-2">9. Changes to This Policy</h2>
      <p className="mb-6 ml-2 sm:ml-4 text-xs sm:text-sm">
        We may update this Privacy Policy from time to time to reflect changes
        in our practices or legal requirements. Any changes will be posted on
        this page with a revised effective date. We encourage you to review this
        policy periodically.
      </p>

      <h2 className="text-base sm:text-lg font-semibold mb-2">10. Contact Us</h2>
      <div className="ml-2 sm:ml-4 mb-6 text-xs sm:text-sm">
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
        <p>Address: Shop No. 5, Lane 7, Shiva Towers, Sector 66, Noida, India</p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
