"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How do hourly stays work?",
    answer:
      "Choose a room and any window of at least 3 hours, up to 30 days. Your request holds the room while the resort reviews it. Once approved, the room is booked for those hours and you pay at the counter.",
  },
  {
    question: "What are the check-in and check-out times?",
    answer:
      "Check-in is from 15:00 to 18:00. Check-out is between 08:00 and 11:00. Please let us know your arrival time in advance, especially if you expect to arrive close to 18:00.",
  },
  {
    question: "How do I get to Mannar?",
    answer:
      "Mannar is reached by road, across the causeway, or by train. Coming from Colombo, the drive runs north through Anuradhapura and Vavuniya. The property is 9 km from Mannar town centre. Transfers from the town or bus stand can be arranged with notice. The nearest airport is Jaffna International, about 85 miles away.",
  },
  {
    question: "Is breakfast included?",
    answer:
      "Breakfast is not included in the room rate but is available on site every day. A halal breakfast is served for LKR 1,329 per person, per day. Dinner can also be arranged — ask the team when you check in or contact us before arrival.",
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "You can cancel from your request page until check-in. No online payment is taken, so there is no card refund to process. An approved guest who does not arrive may have the room released after a 2-hour grace period.",
  },
  {
    question: "How many people can stay in a room?",
    answer:
      "Every room sleeps up to two adults and one child. The booking form checks those limits before it accepts a request.",
  },
  {
    question: "Are children welcome?",
    answer:
      "Yes, within the room's occupancy limit. Mention the ages of any children in the booking notes so the team can prepare.",
  },
  {
    question: "Is parking available?",
    answer:
      "Yes — free private parking is available on site for all guests. No advance booking is needed.",
  },
  {
    question: "Do the rooms have Wi-Fi?",
    answer: "Yes. Wi-Fi is available in every room and in the common areas.",
  },
  {
    question: "How do I pay?",
    answer:
      "This prototype takes no online payment. After the resort approves your request, pay at the counter by cash, card or bank transfer.",
  },
  {
    question: "Can I request more than one room?",
    answer:
      "Yes, subject to availability and the two-active-requests limit per phone number. For a larger group or a family gathering, send an enquiry and the team will arrange it directly.",
  },
  {
    question: "What taxes are added?",
    answer:
      "A 10% service charge and 18% VAT are added to the room charge. VAT is calculated on the room charge plus the service charge. The full breakdown appears in your quote before you send the request.",
  },
  {
    question: "Are pets allowed?",
    answer:
      "Pets are not permitted at the property.",
  },
  {
    question: "Is smoking allowed?",
    answer:
      "Smoking is not allowed anywhere on the property. The resort is entirely non-smoking.",
  },
  {
    question: "What activities are available?",
    answer:
      "The property offers movie nights, happy hour, bike tours, cooking classes, walking tours, themed dinners and tours about local culture. Charges may apply — ask the team on arrival. Guests are also welcome to visit the on-site donkey clinic and welfare centre.",
  },
  {
    question: "Can you arrange a guide or driver?",
    answer:
      "Local guides and drivers can be arranged on request. Ask when you book or send an enquiry with what you have in mind.",
  },
];

export function FaqAccordion() {
  return (
    <Accordion.Root type="single" collapsible className="border-b border-ink/10">
      {faqs.map((item, index) => (
        <Accordion.Item
          key={item.question}
          value={`item-${index}`}
          className="border-t border-ink/10"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-start justify-between gap-6 py-5 text-left">
              <span className="text-base font-medium text-ink group-hover:text-frond">
                {item.question}
              </span>
              <ChevronDown
                className="mt-1 h-4 w-4 shrink-0 text-ink/40 transition-transform duration-200 group-data-[state=open]:rotate-180"
                aria-hidden="true"
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-sm leading-relaxed text-ink/65 data-[state=closed]:animate-none">
            <p className="max-w-2xl pb-6 pr-8">{item.answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
