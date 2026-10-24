export const explorePage = {
  eyebrow: "The surrounding country",
  title: "Mannar, slowly.",
  intro:
    "The island is small enough to cross in a morning and old enough to keep you occupied for a week. These are the places we return to, and the ones we suggest first.",
  note: "All distances and driving times are calculated from Palmyrah Garden & Resort in Puthukkudiyiruppu. Our front desk can arrange private tuk-tuks, vans, knowledgeable local drivers, and packed breakfast boxes for early dawn departures.",
  heroImage: {
    src: "/images/explore/talaimannar-pier.jpg",
    alt: "The shallows, historic 1915 lighthouse, and broken railway pier at Talaimannar, looking across the Palk Strait towards India.",
    caption:
      "Talaimannar Pier and 1915 Lighthouse at the edge of the island, where the historic rail terminus met the ferry to India.",
  },
  quickFacts: [
    {
      label: "Island Scale",
      value: "130 km²",
      detail: "Linked to the mainland by a 3 km causeway",
    },
    {
      label: "Travel Times",
      value: "10–50 min",
      detail: "All island landmarks within an hour's easy drive",
    },
    {
      label: "Flamingo Season",
      value: "Nov – Apr",
      detail: "Over 20,000 migratory waterfowl at Vankalai",
    },
    {
      label: "Living Heritage",
      value: "700+ Years",
      detail: "Ancient Arab trade routes and Portuguese-Dutch forts",
    },
  ],
  suggestedDays: [
    {
      title: "The Island's Edge & Rama Setu",
      subtitle: "Westward towards India",
      duration: "Full day (6–8 hours)",
      stops: [
        "Pallimunai Baobab Tree",
        "Talaimannar Pier & 1915 Lighthouse",
        "Adam's Bridge Sandbanks",
        "Keeri Beach Sunset",
      ],
      description:
        "Head west along the A14 through open palmyrah groves. Stop first at the ancient Baobab tree in Pallimunai, then continue to Talaimannar for the breeze, the weathered railway pier, and low-tide walks along the shoals of Adam's Bridge. Return as the light turns copper over the western beaches.",
    },
    {
      title: "Centuries of Faith & Forest Glades",
      subtitle: "Ancient temples & quiet sanctuaries",
      duration: "Full day (6–7 hours)",
      stops: [
        "Thiruketheeswaram Kovil",
        "Palavi Theertham Sacred Tank",
        "Forest Shrine of Our Lady of Madhu",
        "Village Tea & Palmyra Crafts",
      ],
      description:
        "Cross the causeway early to witness morning puja at Thiruketheeswaram, one of the five ancient Pancha Ishwarams of Shiva. Journey south-east through dry-zone forest to the serene shaded grounds of Our Lady of Madhu, revered across communities for over four centuries.",
    },
    {
      title: "Wetlands, Ramparts & Wildlife",
      subtitle: "Birds, bastions & island stewardship",
      duration: "Half day (4–5 hours)",
      stops: [
        "Vankalai Ramsar Sanctuary at dawn",
        "Mannar Dutch Fort ramparts",
        "Resort Donkey Welfare Centre & Garden",
      ],
      description:
        "Depart at sunrise with a packed breakfast box from our kitchen to observe thousands of Greater Flamingos and migratory waders at Vankalai. Return via the four coral-stone bastions of Mannar Fort, finishing with a relaxed midday visit to our on-site donkey clinic and shaded palmyrah garden.",
    },
  ],
  closing: {
    title: "A day worth taking.",
    body: "Start early, carry water, and leave the middle of the day for the garden. The light is better at both ends of it. Tell us when you arrive and we will tailor an excursion that matches the tide and the season.",
  },
} as const;

