export const contactPage = {
  eyebrow: "Contact",
  title: "Write to us.",
  intro:
    "For dates, questions about the rooms, a group stay or help with the road north, send a note. A person reads every enquiry.",
  form: {
    title: "Send an enquiry",
    fields: {
      name: "Your name",
      email: "Email",
      phone: "Phone (optional)",
      topic: "What is this about?",
      message: "Your message",
    },
    placeholders: {
      name: "Nimali Fernando",
      email: "you@example.com",
      phone: "+94 77 000 0000",
      message: "Tell us what you have in mind — dates, number of guests, anything useful.",
    },
    submit: "Send enquiry",
    pending: "Sending…",
    consent: "We use these details to answer your enquiry. Nothing else.",
    successTitle: "Thank you — your note is with us.",
    successBody:
      "We answer enquiries within one working day. If your message was about dates, we will check availability before we reply.",
    another: "Send another enquiry",
  },
  details: {
    title: "The resort",
    emailLabel: "Email",
    addressLabel: "Where we are",
    hoursLabel: "Reception",
    hours: "Check-in: 15:00\u201318:00 \u00b7 Check-out by 11:00",
    whatsappLabel: "WhatsApp",
    mapLabel: "Mannar, Northern Province",
    mapLink: "Open in Google Maps",
  },
  note: "After booking, all property details including telephone number and full address are provided in your booking confirmation.",
} as const;
