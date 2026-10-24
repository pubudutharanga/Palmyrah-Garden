export const home = {
  hero: {
    place: "Madhu, Sri Lanka",
    headline: "Rest in the shade",
    headlineSuffix: "of the palmyrah.",
    intro:
      "Forty-six AC and non-AC rooms in one garden in Mannar, on Sri Lanka's northern coast — between the lagoon, the baobab and the long road north.",
    photos: [
      {
        src: "/images/hero/resort-hero.jpg",
        alt: "The resort bungalow and shaded garden under a clear morning sky.",
      },
      {
        src: "/images/hero/hero-bedroom.jpg",
        alt: "A bedroom with wooden bed frames, grey bedding and a tall mirror.",
      },
      {
        src: "/images/hero/hero-lounge.jpg",
        alt: "The lounge with a charcoal corner sofa, floral cushions and a wooden coffee table.",
      },
    ],
  },
  story: {
    title: "A garden that gives more than it asks.",
    body: [
      "The palmyrah is the tree of life in the Northern Province. Its leaves roof houses and weave baskets; its sap becomes toddy and jaggery; its trunk becomes timber. Nothing is wasted, and nothing is hurried.",
      "The resort is arranged around that idea. Rooms sit low among the trees. Paths follow the shade instead of cutting through it. Evenings belong to the garden and the sea air.",
    ],
    caption: "The garden at first light, looking east.",
    linkLabel: "More about the place",
  },
  rooms: {
    title: "Two categories, one garden.",
    intro:
      "Keep it simple in the fan-cooled wing, or cool down in the air-conditioned rooms. Choose the comfort level and the hours that suit you, then request a room from the live board.",
    linkLabel: "See the live board",
    photoCaption: "Illustrations; guest photography still to come. TODO(client).",
  },
  mannar: {
    title: "A quieter north.",
    intro:
      "Mannar is not a place you pass through. It is a place you arrive at — the lagoon, the light, the birds, and a history that sits lightly on the landscape.",
    linkLabel: "Explore Mannar",
  },
  gallery: {
    title: "The garden, in pieces.",
    linkLabel: "See the gallery",
  },
  ev: {
    eyebrow: "EV owners — good news",
    title: "Visit Madhu with confidence.",
    intro:
      "Don't be afraid to visit Madhu Church now. Fast, reliable DC charging is available at Palmyrah Garden on the Madhu road — just minutes from the church.",
    tagline: "DC fast EV charging available here · Convenient · Safe · Reliable",
    features: [
      "Fast & reliable DC charging",
      "Safe parking & comfortable environment",
      "Refreshments & rest facilities",
      "Charge while you pray & relax",
      "Perfect stop for pilgrims",
      "Easy access, ideal for long-distance travellers",
    ],
    photo: {
      src: "/images/ev/ev-charging-station.jpg",
      alt: "The EVO Charge 40 kW DC fast charger at Palmyrah Garden Hotel on the Madhu road, with an electric car parked beside it.",
      badge: "40 kW DC fast",
      captionLeft: "Just minutes from Madhu Church",
      captionRight: "Premium · Secure · Convenient",
    },
    location: {
      label: "Location",
      hotel: "Palmyrah Garden Hotel — Madhu Road, Mannar",
      brand: "Palmyrah Garden – Madhu | Sri Lanka",
    },
    phone: {
      label: "0777 323 580",
      href: "tel:+94777323580",
    },
  },
  practical: {
    title: "Before you come.",
    arrival: {
      title: "Getting here",
      linkLabel: "More on getting here",
    },
    times: {
      title: "The booking window",
      labels: {
        checkIn: "Shortest stay",
        checkOut: "Longest stay",
      },
    },
    contact: {
      title: "Ask us anything",
      body: "Questions about rooms, dates, a group stay or the road north? Write to us and a person will answer.",
      linkLabel: "Send an enquiry",
    },
  },
} as const;
