import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// ✅ Import Translation Component
import { TranslatableText } from "@/components/shared/translatable-text";

export function FAQSection() {
  const faqs = [
    {
      question: "Can companies delete bad reviews?",
      answer: "No. Companies cannot delete reviews. They can report a review to our moderation team if they believe it violates our guidelines (e.g., hate speech, spam, conflict of interest). If our team finds no violation, the review stays up, no matter how negative it is."
    },
    {
      question: "Can companies pay to improve their star rating?",
      answer: "Absolutely not. We do not sell better ratings, and companies cannot pay us to hide negative reviews. Our business model is based on selling analytics and customer engagement tools, not on manipulating the truth."
    },
    {
      question: "How do you know if a review is real?",
      answer: "We use a combination of automated fraud-detection algorithms and manual review by our Content Integrity Team. We look for patterns like IP address spoofing, bulk posting, and suspicious timing. We also allow the community to flag suspicious content."
    },
    {
      question: "What does the 'Verified Company' badge mean?",
      answer: "A 'Verified Company' badge means the business has claimed their profile, verified their contact details, and actively manages their account. It does NOT mean they endorse or pay for the reviews on their page."
    },
    {
      question: "Do you edit reviews?",
      answer: "No. We never edit the text or star rating of a review. We believe in preserving the reviewer's original voice. If a review contains a small guideline violation (like a personal phone number), we ask the author to edit it themselves."
    },
    {
      question: "Can I update my review later?",
      answer: "Yes! If your experience with the company changes—for example, if they resolved your issue—you can edit your review at any time from your user dashboard to reflect the current situation."
    },
    {
      question: "Do I need a receipt to write a review?",
      answer: "Not necessarily. We accept reviews for service experiences (like customer support calls) even if no purchase was made. However, if a review is flagged, we may ask for documentation (like a receipt, screenshot, or email confirmation) to verify a genuine interaction occurred."
    },
    {
      question: "Why was my review removed?",
      answer: "Reviews are typically removed for violating our Guidelines. Common reasons include: hate speech, promotional content (spam), including personal private information, or if the review is not based on a genuine service experience."
    }
  ];

  return (
    <div className="py-20 sm:py-15 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto max-w-3xl px-4">
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg font-medium text-gray-900 hover:text-[#0ABED6] transition-colors">
                {/* ✅ Translate Question */}
                <TranslatableText text={faq.question} />
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed pb-6 text-base">
                {/* ✅ Translate Answer */}
                <TranslatableText text={faq.answer} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}