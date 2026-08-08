import { MetaTagsProvider } from "@/components/MetaTagsProvider";
import React from "react";

export default function TermsAndConditionPage() {
  return (
    <div className="mx-auto px-4 sm:px-8 md:px-16 lg:px-32 py-8 md:py-12 text-gray-700 leading-relaxed max-w-8xl">
      <MetaTagsProvider
        title="Terms and Conditions | SilaiGo"
        description="Terms and Conditions for SilaiGo. Learn about our policies and guidelines for using our services."
      />
      <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-8 md:mb-10">
        Terms and Conditions
      </h1>
      <div className="space-y-8 text-gray-700 text-xs sm:text-sm leading-relaxed">
        <div className="space-y-8">
          <div>
            {" "}
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              1. Acceptance of Terms
            </h2>
            <p className="text-xs sm:text-sm text-gray-700">
              By accessing or using our services, you agree to comply with and
              be legally bound by these terms. Please ensure that you:
            </p>
            <ol className="list-decimal list-inside mt-2 text-xs sm:text-sm space-y-2">
              <li>
                <strong>
                  Read the Terms and Conditions in full before placing an order:
                </strong>{" "}
                It is your responsibility to thoroughly review all the terms and
                conditions outlined on this page before initiating any
                transaction or placing an order with us. This ensures you are
                fully aware of your rights, obligations, and the scope of our
                services.
              </li>
              <li>
                <strong>
                  Do not access the service if you disagree with any part of the
                  Terms:
                </strong>{" "}
                If you do not agree with any clause or policy mentioned herein,
                you must refrain from using our website, mobile application, or
                any related services. Accessing or using our services without
                agreement constitutes a breach of these terms.
              </li>
              <li>
                <strong>
                  Understand that continued use implies acceptance of updates:
                </strong>{" "}
                We may update or modify these terms periodically. Continued use
                of our services after such updates will be considered as your
                acceptance of the revised terms. We recommend reviewing this
                page regularly to stay informed.
              </li>
            </ol>
          </div>

          <div>
            {" "}
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              2. Service Overview
            </h2>
            <ol className="list-decimal list-inside text-xs sm:text-sm space-y-2">
              <li>
                <strong>Doorstep fabric pickup:</strong> We offer a convenient
                pickup service where our agents collect your fabric directly
                from your specified address at a scheduled time, eliminating the
                need for you to visit our premises.
              </li>
              <li>
                <strong>
                  Garment customization through online selections:
                </strong>{" "}
                You can customize your garment by selecting styles, patterns,
                and measurements through our online platform, ensuring a
                personalized tailoring experience.
              </li>
              <li>
                <strong>Stitching and delivery within 48 working hours:</strong>{" "}
                Once your fabric is picked up and your order is confirmed, we
                commit to completing the stitching and delivering the finished
                garment to your doorstep within 48 working hours, subject to
                certain conditions.
              </li>
              <li>
                <strong>Alteration support if required:</strong> If the
                delivered garment does not fit as expected, we provide
                alteration services to ensure your satisfaction, as per our
                alteration policy.
              </li>
            </ol>
          </div>

          <div>
            {" "}
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              3. 48-Hour Delivery Commitment
            </h2>
            <ol className="list-decimal list-inside text-xs sm:text-sm space-y-2">
              <li>
                <strong>Countdown starts post successful fabric pickup:</strong>{" "}
                The 48-hour delivery window begins only after your fabric has
                been successfully collected by our agent and all order details
                are confirmed.
              </li>
              <li>
                <strong>
                  Subject to availability and volume; delays will be
                  communicated:
                </strong>{" "}
                While we strive to meet the 48-hour commitment, high order
                volumes or unforeseen circumstances may cause delays. In such
                cases, we will proactively inform you about the revised
                timelines.
              </li>
              <li>
                <strong>
                  Public holidays and local restrictions may impact timelines:
                </strong>{" "}
                National holidays, local events, or government-imposed
                restrictions may affect our ability to deliver within the
                promised timeframe. We will notify you if such situations arise.
              </li>
            </ol>
          </div>

          <div>
            {" "}
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              4. Fabric Pickup & Delivery
            </h2>
            <ol className="list-decimal list-inside text-xs sm:text-sm space-y-2">
              <li>
                <strong>Pickup occurs at the scheduled time slot:</strong> Our
                team will arrive at your address during the time slot you select
                while placing the order. Please ensure someone is available to
                hand over the fabric.
              </li>
              <li>
                <strong>Orders cannot be canceled after dispatch:</strong> Once
                your order has been dispatched for pickup, cancellation is not
                permitted. Please review your order carefully before confirming.
              </li>
              <li>
                <strong>
                  Delivery is to the same address unless changed in advance:
                </strong>{" "}
                The finished garment will be delivered to the pickup address
                unless you notify us of a change before the delivery process
                begins.
              </li>
              <li>
                <strong>
                  Ensure availability at pickup and delivery times:
                </strong>{" "}
                It is your responsibility to be present or arrange for someone
                to be available at the specified address during both pickup and
                delivery to avoid delays or missed appointments.
              </li>
            </ol>
          </div>

          <div>
            {" "}
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              5. Alteration & Fit Guarantee
            </h2>
            <ol className="list-decimal list-inside text-xs sm:text-sm space-y-2">
              <li>
                <strong>
                  Immediate collection for alteration if fit is incorrect at
                  delivery:
                </strong>{" "}
                If you find the fit unsatisfactory at the time of delivery, our
                agent can collect the garment immediately for necessary
                alterations.
              </li>
              <li>
                <strong>Requests allowed within 2 days post-delivery:</strong>{" "}
                You may request alterations within 2 days of receiving your
                garment. Requests made after this period may not be eligible for
                free alteration.
              </li>
              <li>
                <strong>Alterations must match original specifications:</strong>{" "}
                Alteration requests should pertain only to the original
                measurements and design provided at the time of order. Any
                deviation may incur additional charges.
              </li>
              <li>
                <strong>
                  Design changes are not eligible for free alteration:
                </strong>{" "}
                Requests to change the style, pattern, or design after delivery
                are not covered under the free alteration policy and will be
                treated as new orders.
              </li>
            </ol>
          </div>

          <div>
            {" "}
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              6. Refunds for Damage
            </h2>
            <ol className="list-decimal list-inside text-xs sm:text-sm space-y-2">
              <li>
                <strong>
                  Provide photographic/video proof within 24 hours of delivery:
                </strong>{" "}
                If your fabric or garment is damaged, you must submit clear
                photographic or video evidence within 24 hours of receiving the
                delivery to initiate a refund claim.
              </li>
              <li>
                <strong>
                  Refund based on verified fabric value and receipt:
                </strong>{" "}
                Refunds will be processed based on the actual value of the
                fabric, as verified by your purchase receipt or other valid
                proof of value.
              </li>
              <li>
                <strong>SILAIGO reserves final discretion over refunds:</strong>{" "}
                All refund decisions are at the sole discretion of SILAIGO,
                based on the evidence provided and internal investigation.
              </li>
              <li>
                <strong>Fraudulent claims will be rejected:</strong> Any attempt
                to submit false or misleading claims will result in immediate
                rejection and may lead to suspension of services.
              </li>
            </ol>
          </div>

          <div>
            {" "}
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              7. Order Cancellation & Refunds
            </h2>
            <ol className="list-decimal list-inside text-xs sm:text-sm space-y-2">
              <li>
                <strong>Orders can be cancelled before pickup dispatch:</strong>{" "}
                You may cancel your order without penalty as long as the pickup
                agent has not been dispatched. Please contact us promptly for
                cancellations.
              </li>
              <li>
                <strong>No cancellation once agent is dispatched:</strong> Once
                the pickup process has begun, cancellations are not permitted,
                and you will be liable for the full order amount.
              </li>
              <li>
                <strong>
                  Full refund if SILAIGO is unable to fulfill the order:
                </strong>{" "}
                In the rare event that we are unable to process your order due
                to unforeseen circumstances, you will receive a full refund of
                any payments made.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              8. Payment Terms
            </h2>
            <ol className="list-decimal list-inside text-xs sm:text-sm space-y-2">
              <li>
                <strong>
                  Accepted methods: UPI, cards, cash (in some cases):
                </strong>{" "}
                We accept payments through UPI, credit/debit cards, and cash
                (where applicable). Please confirm available payment options at
                the time of order.
              </li>
              <li>
                <strong>
                  Base price includes stitching, pickup, delivery:
                </strong>{" "}
                The quoted price covers the cost of stitching, fabric pickup,
                and delivery. There are no hidden charges for these core
                services.
              </li>
              <li>
                <strong>
                  Add-ons (lining, designer details) are charged separately:
                </strong>{" "}
                Any additional features such as lining, designer embellishments,
                or special requests will incur extra charges, which will be
                communicated to you before order confirmation.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              9. Intellectual Property
            </h2>
            <p className="text-xs sm:text-sm ">
              All designs, patterns, proprietary tools (such as SILAIGO DYNAMO
              and SILAIGO CAD), and user interface elements provided by SILAIGO
              are protected by intellectual property laws. Unauthorized use,
              reproduction, or distribution of these assets is strictly
              prohibited and may result in legal action.
            </p>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              10. Service Limitations
            </h2>
            <ol className="list-decimal list-inside text-xs sm:text-sm space-y-2">
              <li>
                <strong>
                  Currently serving: Noida, Indirapuram, Mayur Vihar,
                  Vasundhara, Gaur City:
                </strong>{" "}
                Our services are currently limited to these locations. Orders
                from outside these areas may not be accepted.
              </li>
              <li>
                <strong>
                  Exact designer replicas are not guaranteed unless agreed upon:
                </strong>{" "}
                While we strive to match your design preferences, we do not
                guarantee exact replicas of designer garments unless explicitly
                agreed in writing.
              </li>
              <li>
                <strong>
                  SILAIGO is not liable for stitching issues with pre-damaged
                  fabric:
                </strong>{" "}
                If the fabric provided is already damaged or defective, SILAIGO
                cannot be held responsible for any resulting issues in the
                finished garment.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              11. Dispute Resolution
            </h2>
            <ol className="list-decimal list-inside text-xs sm:text-sm space-y-2">
              <li>
                <strong>Contact:</strong> For any disputes, concerns, or
                grievances, please reach out to us via email at{" "}
                <strong>support@silaigo.com </strong> or phone at{" "}
                <strong> +91 88006-33755</strong>. We are committed to resolving
                your issues promptly.
              </li>
              <li>
                <strong>Resolution attempted within 7 working days:</strong> We
                aim to address and resolve all disputes within 7 working days
                from the date of receipt of your complaint.
              </li>
              <li>
                <strong>
                  Disputes governed by Indian Law, under Noida jurisdiction:
                </strong>{" "}
                All disputes arising from these terms or our services will be
                governed by the laws of India and subject to the exclusive
                jurisdiction of courts in Noida.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              12. Contact Us
            </h2>
            <ul className="list-disc list-inside text-xs sm:text-sm space-y-2">
              <li>
                <strong>📞 Phone:</strong> +91 88006-33755
              </li>
              <li>
                <strong>✉️ Email:</strong> support@silaigo.com
              </li>
              <li>
                <strong>📍 Address:</strong> Shop No. 5, Lane 7, Shiva Towers Sector 66, Noida, India
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
