import type { Metadata } from "next";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "About",
  description: "The story, science and policies behind PEPTIVA peptide skincare.",
};

const FAQS = [
  {
    q: "How long until I see results?",
    a: "Most customers report visible changes to texture and firmness within 4-8 weeks of consistent, daily use as part of a complete routine.",
  },
  {
    q: "Can I use PEPTIVA products together?",
    a: "Yes — our formulas are designed to layer. We recommend starting with essences, then serums or treatments, finishing with a moisturizer.",
  },
  {
    q: "Are your products cruelty-free?",
    a: "Yes, all PEPTIVA formulas are cruelty-free and never tested on animals.",
  },
  {
    q: "Do you ship internationally?",
    a: "We currently ship to the United States, Canada, the United Kingdom and Australia, with more regions coming soon.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <section id="story" className="scroll-mt-24">
        <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">Our Story</p>
        <h1 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">About PEPTIVA</h1>
        <p className="mt-5 text-sm leading-relaxed text-stone-600">
          PEPTIVA was founded on a simple idea: that skincare backed by thoughtful formulation
          shouldn&apos;t feel clinical or complicated. We work with peptide chemistry — the same
          building blocks the skin already uses — to create routines that are simple to follow
          and satisfying to use every day.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          Every formula is developed to support the appearance of firmer, smoother,
          healthier-looking skin, using ingredient concentrations we&apos;re proud to stand behind.
        </p>
      </section>

      <section id="ingredients" className="mt-16 scroll-mt-24">
        <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">Ingredients</p>
        <h2 className="mt-2 font-serif text-2xl text-charcoal sm:text-3xl">
          What goes into every formula
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          Each product is built around a targeted peptide complex, paired with complementary
          ingredients selected for comfort and absorption — think sodium hyaluronate for
          lightweight hydration, ceramides to support the look of a healthy barrier, and
          soothing botanicals like centella asiatica. We avoid unnecessary fragrance and formulate
          every product to be gentle enough for daily use.
        </p>
      </section>

      <section id="shipping" className="mt-16 scroll-mt-24">
        <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">Shipping</p>
        <h2 className="mt-2 font-serif text-2xl text-charcoal sm:text-3xl">Shipping Information</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          Standard shipping (5-7 business days) is complimentary on orders over $75, or $6.95
          otherwise. Express shipping (2-3 business days) is available for $12 at checkout.
        </p>
      </section>

      <section id="returns" className="mt-16 scroll-mt-24">
        <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">Returns</p>
        <h2 className="mt-2 font-serif text-2xl text-charcoal sm:text-3xl">Returns &amp; Exchanges</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          If you&apos;re not satisfied with a purchase, unopened products can be returned within 30
          days of delivery for a full refund. Opened products may be eligible for store credit —
          reach out to our customer care team to start a return.
        </p>
      </section>

      <section id="faq" className="mt-16 scroll-mt-24">
        <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">Support</p>
        <h2 className="mt-2 font-serif text-2xl text-charcoal sm:text-3xl">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="mt-4">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section id="contact" className="mt-16 scroll-mt-24">
        <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">Get in Touch</p>
        <h2 className="mt-2 font-serif text-2xl text-charcoal sm:text-3xl">Contact Us</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          Our customer care team is available Monday-Friday, 9am-6pm ET at{" "}
          <span className="text-charcoal">hello@peptiva.com</span>.
        </p>
      </section>

      <section id="privacy" className="mt-16 scroll-mt-24">
        <p className="text-xs font-medium uppercase tracking-wider text-sage-dark">Legal</p>
        <h2 className="mt-2 font-serif text-2xl text-charcoal sm:text-3xl">Privacy Policy</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          This is a demonstration storefront. No real personal information is collected, sold or
          shared — data entered here (such as checkout details) is stored only in your browser&apos;s
          local storage for the purpose of this demo and is never transmitted to a server.
        </p>
      </section>

      <section id="terms" className="mt-16 scroll-mt-24">
        <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">Terms of Service</h2>
        <p className="mt-4 text-sm leading-relaxed text-stone-600">
          PEPTIVA is a fictional brand created for demonstration purposes. No real transactions
          are processed and no products are shipped.
        </p>
        <p className="mt-6 rounded-xl bg-beige px-4 py-3 text-xs leading-relaxed text-stone-600">
          These products are cosmetic/wellness formulations and are not intended to diagnose,
          treat, cure, or prevent disease.
        </p>
      </section>
    </div>
  );
}
