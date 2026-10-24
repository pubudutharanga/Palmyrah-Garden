import type { SceneKey } from "@/content/rooms";

/**
 * Resort facts and practical information.
 * Values marked TODO(client) are prototype assumptions for the demo.
 */

export const resort = {
  name: "The Palmyrah Garden & Resort",
  shortName: "Palmyrah Garden",
  location: "Puthukkudiyiruppu, Mannar, Northern Province, Sri Lanka",
  property: {
    legalName: "The Palmyrah Garden and Resort",
    address: "Puthukkudiyiruppu, Mannar, 41000, Sri Lanka",
    streetAddress: "Puthukkudiyiruppu, Mannar",
    postalCode: "41000",
    email: "reservations@palmyrahgarden.lk",
    phone: "TODO(client) — reservations line",
    whatsapp: "",
    tin: "TODO(client)",
    vatRegNo: "TODO(client)",
    sltdaRegNo: "TODO(client)",
    coordinates: { lat: 8.981, lng: 79.904 },
  },
  stay: {
    checkInTime: "15:00",
    checkInUntil: "18:00",
    checkOutTime: "11:00",
    checkOutUntil: "11:00",
    minNights: 1,
    maxNights: 30,
    maxAdvanceDays: 365,
    depositPercent: 30,
    freeCancellationHours: 72,
    lateCancellationNights: 1,
  },
  summary:
    "A garden homestay in Puthukkudiyiruppu, Mannar — family rooms, halal breakfast served daily, free private parking, and a serene garden setting.",
  intro:
    "A garden of palmyrah and old shade, five wings of rooms, and the Gulf of Mannar a little beyond the trees.",
  facilities: [
    {
      title: "The garden",
      body: "A lush, serene garden with a private entrance — the perfect place to unwind and enjoy the northern coast air.",
    },
    {
      title: "Breakfast",
      body: "Halal breakfast served daily on site. Available for LKR 1,329 per person, per day. Dinner can also be arranged on request.",
    },
    {
      title: "Free private parking",
      body: "Free on-site private parking for all guests travelling by car or van — no booking required.",
    },
    {
      title: "Air-conditioning and fan",
      body: "Every family room has both air-conditioning and a ceiling fan for comfortable nights in any season.",
    },
    {
      title: "Kitchen facilities",
      body: "Each room includes a refrigerator. A washing machine and ironing facilities are also available.",
    },
    {
      title: "Donkey welfare centre",
      body: "The owners run an on-site donkey clinic and education centre, treating wounded wild donkeys and promoting community co-existence. Guests are warmly invited to visit.",
    },
    {
      title: "Activities",
      body: "Movie nights, happy hour, bike tours, cooking classes, walking tours, themed dinners and local culture tours are available on site (charges may apply).",
    },
    {
      title: "Transfers",
      body: "Transfers from Mannar town or the bus stand can be arranged with notice. The property is 9 km from Mannar town centre and approximately 85 miles from Jaffna International Airport.",
    },
  ],
  gettingHere: {
    intro:
      "Mannar is reached by road, across the causeway from the mainland and along the northern coast.",
    paragraphs: [
      "Coming from Colombo, the road north runs through Anuradhapura and Vavuniya before turning west towards Mannar. The last stretch crosses the lagoon, and the light changes as soon as you reach the island.",
      "There is a railway line to Mannar. Tell us your arrival point and we will help you plan the last part of the journey.",
    ],
    // TODO(client): distances and travel times.
    note: "Travel times and transfer prices to be confirmed.",
  },
  contact: {
    email: "reservations@palmyrahgarden.lk",
    responseTime: "We answer enquiries within one working day.",
    mapQuery: "The Palmyrah Garden and Resort, Puthukkudiyiruppu, Mannar, Sri Lanka",
  },
  policies: {
    cancellation: {
      title: "Cancellation policy",
      intro: "These terms apply to direct requests made on this website.",
      points: [
        "A pending request holds the room for 2 hours while the resort reviews it.",
        "You can cancel from your request page until check-in.",
        "No online payment is taken; approved stays are paid at the counter.",
        "An approved guest who does not arrive may have the room released after a 2-hour grace period.",
      ],
      note: "TODO(client): the owner and accountant must confirm these terms before launch.",
    },
    privacy: {
      title: "Privacy",
      intro:
        "This prototype stores the details you submit so that a reservation or enquiry can be answered.",
      points: [
        "We collect your name, contact details and stay preferences.",
        "Identification is not collected online. It is seen at check-in only.",
        "Enquiry IP addresses are stored only as a one-way hash.",
        "We do not sell guest data.",
      ],
      note: "TODO(client): replace with the property's reviewed privacy policy.",
    },
    terms: {
      title: "Terms",
      intro:
        "These are placeholder terms for the prototype. They will be replaced with the property's reviewed booking terms.",
      points: [
        "A request is not a confirmed booking until the resort approves it.",
        "Room rates are quoted in Sri Lankan rupees and include the service charge and VAT shown in the quote.",
        "Every room sleeps up to two adults and one child.",
        "The resort may decline a stay that exceeds the booked occupancy.",
        "Stays are paid at the counter; this prototype takes no online payment.",
      ],
      note: "TODO(client): legal review required.",
    },
  },
} as const;

export type NearbyPlace = {
  id: string;
  name: string;
  scene?: SceneKey;
  src?: string;
  category?: string;
  distance?: string;
  travelTime?: string;
  bestTime?: string;
  highlights?: readonly string[];
  intro: string;
  body: string;
  practicalTips?: string;
  note?: string;
};

export const nearbyPlaces: NearbyPlace[] = [
  {
    id: "talaimannar",
    name: "Talaimannar Pier & Lighthouse",
    scene: "explore.talaimannar",
    src: "/images/explore/talaimannar-pier.jpg",
    category: "Coastal & Maritime",
    distance: "38 km from resort",
    travelTime: "~45 min drive along A14",
    bestTime: "Early morning or late afternoon (6:00 – 8:30 AM / 4:30 – 6:30 PM)",
    highlights: [
      "Historic 1915 cylindrical concrete lighthouse",
      "Terminus of the Indo-Ceylon Boat Mail railway",
      "Calm turquoise shallows and coastal palmyrah groves",
    ],
    intro: "The end of the island, a broken pier, and the shallows that stretch towards India.",
    body: "The pier at Talaimannar once carried a ferry across to Dhanushkodi, connecting the rail systems of Sri Lanka and India. It is unused now, but the weather-beaten concrete pilings and the 19-metre white lighthouse still anchor the horizon. The shallows here are crystal clear and gentle; local fishermen launch catamarans at dawn, and the light at sunset turns the tidal flats into mirrors.",
    practicalTips: "Steady coastal breeze throughout the day. Local vendors often offer fresh palmyrah toddy and snacks along the shore road. Combine with a walk along the sand spit.",
  },
  {
    id: "adams-bridge",
    name: "Adam's Bridge (Rama Setu)",
    scene: "explore.talaimannar",
    src: "/images/explore/adams-bridge.jpg",
    category: "Coastal & Maritime",
    distance: "40 km from resort",
    travelTime: "~50 min drive to sandspit",
    bestTime: "Low tide during calm months (March to September)",
    highlights: [
      "Chain of 18 natural limestone shoals and sandbars",
      "Sacred geological bridge celebrated in the Ramayana",
      "Vibrant turquoise waters where Palk Strait meets Gulf of Mannar",
    ],
    intro: "A legendary chain of shoals curving 48 kilometres across the ocean to India.",
    body: "Extending from the tip of Talaimannar, Adam's Bridge is a striking chain of limestone shoals and shifting white sand islands that almost reach Rameswaram in Tamil Nadu. In ancient Sanskrit literature, it was built by Lord Rama's army; in geology, it marks the submerged former land bridge between the two landmasses. Walking out onto the first sandbars at low tide is an unforgettable, edge-of-the-world experience.",
    practicalTips: "Authorized boat excursions to the offshore islands can be booked during calm sea seasons. Carry drinking water, high SPF sun protection, and footwear suited for wet sand.",
  },
  {
    id: "fort",
    name: "Mannar Dutch Fort",
    scene: "explore.fort",
    src: "/images/explore/mannar-fort.jpg",
    category: "Colonial Heritage",
    distance: "8.5 km from resort",
    travelTime: "~12–15 min drive",
    bestTime: "Late afternoon (4:00 – 6:00 PM) when rampart stones cool down",
    highlights: [
      "Square fortress with four intact corner bastions",
      "Built by Portuguese in 1560; rebuilt by the Dutch in 1658",
      "Panoramic views overlooking the lagoon and causeway",
    ],
    intro: "A compact square fortress on the island's gateway, with the lagoon on three sides.",
    body: "The Portuguese erected the first fortification here to control the lucrative pearl fishery and the narrow strait between Mannar and the mainland. The Dutch took it in 1658, constructing the sturdy square ramparts and four corner bastions that endure today. What remains inside is weathered and tranquil—an old Dutch church, arched brick cellars, and stone steps leading up to wide ramparts overlooking fishing boats skimming across the lagoon.",
    practicalTips: "Open daily from 8:00 AM to 6:00 PM. Admission is free. Stroll slowly along the ramparts for late-afternoon photography, then visit the causeway fishing stalls.",
  },
  {
    id: "baobab",
    name: "The 700-Year-Old Baobab Tree",
    scene: "explore.baobab",
    src: "/images/explore/baobab-tree.jpg",
    category: "Botanical Heritage",
    distance: "7.5 km from resort",
    travelTime: "~10 min drive",
    bestTime: "Late afternoon towards sunset, when the trunk turns copper",
    highlights: [
      "19.5-metre trunk circumference (Adansonia digitata)",
      "Planted by medieval Arab horse and spice merchants",
      "One of Sri Lanka's oldest living exotic monuments",
    ],
    intro: "A tree out of another continent, rooted in Mannar's centuries of Arabian trade.",
    body: "Known locally in Tamil as Perukka Maram (the Elephant Tree), this colossal baobab stands in Pallimunai just north of Mannar town. Native to Madagascar and mainland Africa, it is believed to have been planted over 700 years ago by Arab merchants who traded Arabian horses and pearls through Mannar's ports. Its sculptural, swollen trunk and crown of branches make it an extraordinary presence against the coastal sky.",
    practicalTips: "Located in a quiet roadside clearing in Pallimunai. An easy 15-minute stop en route between the town and the fort.",
  },
  {
    id: "thiruketheeswaram",
    name: "Thiruketheeswaram Kovil",
    scene: "explore.temple",
    src: "/images/explore/thiruketheeswaram.jpg",
    category: "Sacred Sanctuaries",
    distance: "15 km from resort",
    travelTime: "~20 min drive across causeway",
    bestTime: "Morning puja (6:00 AM) or evening puja (5:30 PM)",
    highlights: [
      "One of the 5 sacred Pancha Ishwarams dedicated to Shiva",
      "Ancient port city heritage dating back over 2,500 years",
      "Sacred Palavi Theertham ceremonial tank reflecting the Gopuram",
    ],
    intro: "An ancient Shiva temple praised in 7th-century hymns, still vibrating with daily prayer.",
    body: "Situated near the historic port of Manthai, Thiruketheeswaram is one of Sri Lanka's five ancient Ishwarams and a site of deep pilgrimage. Mentioned in the classical Sangam literature and celebrated in hymns by the Tamil poet-saints Sundarar and Sambandar, the temple sits beside the sacred Palavi Theertham water tank. Its vibrant multi-tiered Gopuram tower, echoing bells, and scent of camphor and jasmine offer a deeply atmospheric experience.",
    practicalTips: "Modest dress is required: shoulders and knees covered, shoes removed at the entrance. Men customarily remove their shirts when entering the inner courtyard for puja.",
  },
  {
    id: "vankalai",
    name: "Vankalai Bird Sanctuary",
    scene: "explore.vankalai",
    src: "/images/explore/vankalai-sanctuary.jpg",
    category: "Wildlife & Ramsar Wetland",
    distance: "16 km from resort",
    travelTime: "~22 min drive",
    bestTime: "Dawn (6:00 – 8:30 AM) during migratory season (Nov–April)",
    highlights: [
      "Ramsar-designated wetland covering over 4,800 hectares",
      "Wintering home for thousands of Greater Flamingos",
      "Over 150 species of migratory waterfowl, waders, and raptors",
    ],
    intro: "Shallow lagoons, salt flats and scrub — the north's premier bird country.",
    body: "Vankalai Sanctuary is an internationally recognized Ramsar wetland where the mainland meets the Gulf of Mannar. Every winter, thousands of migratory waterfowl journey down the Central Asian Flyway to feed in its shallow waters. The spectacle of vast pink colonies of Greater Flamingos wading through misty sunrise lagoons alongside northern pintails, black-tailed godwits, and spot-billed ducks is one of the island's greatest natural wonders.",
    practicalTips: "Bring binoculars, spotting scopes, or telephoto lenses. We can prepare an early morning packed breakfast box from the kitchen so you can be on the bunds at first light.",
  },
  {
    id: "madhu",
    name: "National Shrine of Our Lady of Madhu",
    scene: "explore.madhu",
    src: "/images/explore/madhu-shrine.jpg",
    category: "Sacred Sanctuaries",
    distance: "78 km from resort",
    travelTime: "~1 hr 20 min drive via A14",
    bestTime: "Morning or mid-afternoon (peaceful outside major feast days)",
    highlights: [
      "400-year-old pilgrimage sanctuary deep in dry-zone forest",
      "Venerated by Catholics, Buddhists, and Hindus alike",
      "Famous annual Feast of Our Lady of Madhu in August",
    ],
    intro: "A sanctuary in the dry-zone forest, and one of the country's most revered constants.",
    body: "The national shrine at Madhu has drawn pilgrims for over four centuries across every chapter of Sri Lanka's history. Hidden amidst peaceful dry-zone woodland, the church was established in the 17th century when Catholic families fled coastal persecutions carrying the sacred statue of Our Lady of Good Health. A palpable stillness settles over the expansive shaded grounds, where pilgrims of all backgrounds gather to pray and drink from the freshwater springs.",
    practicalTips: "Dress respectfully with covered attire. Allow approximately half a day for the journey, visit, and quiet reflection. Private transfer can be arranged by the resort.",
  },
  {
    id: "donkeys",
    name: "Mannar Feral Donkeys & On-Site Welfare Clinic",
    scene: "story.garden",
    src: "/images/explore/mannar-donkeys.jpg",
    category: "Living Heritage & Animal Welfare",
    distance: "On-site at Palmyrah Garden & Resort",
    travelTime: "0 min (on the resort grounds)",
    bestTime: "Morning feeding and clinic hours (8:30 – 10:30 AM)",
    highlights: [
      "Unique feral donkey population found only in Mannar",
      "Resort owners operate an on-site rescue clinic & welfare centre",
      "Community educational initiative promoting humane co-existence",
    ],
    intro: "Gentle relics of the spice route, cared for right here in the resort's garden.",
    body: "Roaming freely across Mannar's sandy tracks and scrublands, the island's feral donkeys are descendants of animals brought by Arab and Somali merchants centuries ago to transport pearls, spices, and firewood. Today, Palmyrah Garden & Resort proudly runs an on-site donkey clinic and rehabilitation shelter, treating injured wild donkeys and fostering compassionate community stewardship. Guests are warmly invited to visit the paddocks, meet the resident animals, and learn about our conservation work.",
    practicalTips: "Guests can visit the welfare centre free of charge. Ask at the front desk for clinic tour times or how to support our feed and medical fund.",
  },
  {
    id: "doric",
    name: "The Doric at Arippu & Pearl Fishery Coast",
    scene: "explore.fort",
    src: "/images/explore/doric-arippu.jpg",
    category: "Colonial Heritage",
    distance: "36 km from resort",
    travelTime: "~45 min drive south on mainland coast",
    bestTime: "Late afternoon for coastal photography and golden light",
    highlights: [
      "1801 neoclassical mansion ruins of Governor Frederick North",
      "Historic centre of the celebrated Gulf of Mannar pearl fisheries",
      "Dramatic sea-cliff panoramas and nearby Arippu Dutch Fort",
    ],
    intro: "Windswept brick ruins on a coastal bluff overlooking the historic pearl banks.",
    body: "Perched dramatically atop an eroding clay bluff in Arippu, The Doric was built in 1801 by the first British Governor of Ceylon, Frederick North. Designed in classical Doric style with chunam plaster made from burnt seashells, the grand residence allowed the Governor to personally inspect the lucrative oyster pearl harvests. Today, the weathered brick skeleton stands poetically against the crashing waves of the Gulf of Mannar.",
    practicalTips: "Wear comfortable walking shoes. Combine your visit with the nearby ruins of Arippu Dutch Fort, one of the smallest forts in Ceylon.",
  },
];

export const enquiryTopics = [
  { value: "stay", label: "A stay" },
  { value: "group", label: "A group or family gathering" },
  { value: "other", label: "Something else" },
] as const;
