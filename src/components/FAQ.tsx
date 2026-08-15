import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the doorstep fabric pickup work?",
    answer:
      "Once you book a service via our website or WhatsApp, our executive will visit your home at your scheduled time to collect the fabric and take necessary measurements or collect a sample garment for reference.",
  },
  {
    question: "Do I need to provide the lining and other materials?",
    answer:
      "You can either provide your own lining and materials like pads or latkans, or you can choose from our high-quality options for an additional charge. We'll discuss these options during the pickup.",
  },
  {
    question: "What is your typical delivery timeline?",
    answer:
      "Our standard delivery time is 7 working days. For our Designer and Bridal plans, we offer express delivery within 5 days. We ensure your perfectly stitched blouse reaches your doorstep on time.",
  },
  {
    question: "What if the fitting is not perfect?",
    answer:
      "We offer a 'Perfect Fit Guarantee'. If you're not satisfied with the fitting, we provide free alterations. Just let us know within 7 days of delivery, and we'll pick it up, fix it, and deliver it back to you at no extra cost.",
  },
  {
    question: "Can I share my own design images?",
    answer:
      "Yes, absolutely! You can share reference images via WhatsApp or show them to our executive during pickup. Our expert karigars are skilled at replicating designs with high precision.",
  },
  {
    question: "Are there any extra charges for customizations?",
    answer:
      "Basic customizations are included in our Designer and Bridal plans. However, very heavy embroidery, handwork, or expensive boutique-sourced latkans may incur additional material/labor costs, which will be quoted upfront.",
  },
];

export default function FAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="w-full bg-background px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2
            id="faq-heading"
            className="mb-4 font-playfair text-4xl font-bold text-neutral-charcoal md:text-5xl"
          >
            Frequently Asked Questions
          </h2>

          <p className="font-montserrat text-base text-neutral-charcoal/70 md:text-lg">
            Everything you need to know about our boutique stitching services.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={`faq-${index}`}
              value={`item-${index}`}
              className="border-neutral-sand/50 px-2"
            >
              <AccordionTrigger className="py-5 text-left font-playfair text-lg font-semibold leading-tight text-neutral-charcoal transition-colors hover:text-primary hover:no-underline">
                {faq.question}
              </AccordionTrigger>

              <AccordionContent className="pb-6 font-montserrat text-base leading-relaxed text-neutral-charcoal/75">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
