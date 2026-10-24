/**
 * Room catalogue and the assumed 46-room split.
 * Rates, sizes, bedding and amenities are prototype assumptions — TODO(client).
 */

export type SceneKey =
  | "hero.dusk"
  | "story.garden"
  | "about.weave"
  | "rooms.garden.1"
  | "rooms.garden.2"
  | "rooms.garden.3"
  | "rooms.deluxe.1"
  | "rooms.deluxe.2"
  | "rooms.deluxe.3"
  | "rooms.cottage.1"
  | "rooms.cottage.2"
  | "rooms.family.1"
  | "rooms.family.2"
  | "rooms.villa.1"
  | "rooms.villa.2"
  | "rooms.villa.3"
  | "explore.madhu"
  | "explore.temple"
  | "explore.vankalai"
  | "explore.fort"
  | "explore.baobab"
  | "explore.talaimannar"
  | "gallery.1"
  | "gallery.2"
  | "gallery.3"
  | "gallery.4"
  | "gallery.5"
  | "gallery.6";

export type RoomImage = {
  scene?: SceneKey;
  src?: string;
  alt: string;
};

export type RoomTypeContent = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string[];
  baseRate: number;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  bedding: string;
  sizeSqm: number;
  amenities: string[];
  images: RoomImage[];
  wing: string;
  sortOrder: number;
};

export const ROOM_TYPES: RoomTypeContent[] = [
  {
    id: "garden-room",
    slug: "garden-room",
    name: "Garden Room",
    tagline: "Ground level, garden-facing.",
    summary:
      "A calm, uncomplicated room with a veranda that opens straight into the garden.",
    description: [
      "The Garden Rooms sit at ground level in the oldest part of the property, where the palmyrah canopy is thickest. Each has a small veranda with two chairs — a good place for the first coffee of the day, before the garden warms up.",
      "Inside, the room is quiet and pared back: a king or twin beds, a writing table, an ensuite with hot water. Nothing competes with the garden.",
    ],
    baseRate: 1_850_000,
    maxAdults: 2,
    maxChildren: 1,
    maxOccupancy: 3,
    bedding: "King or twin",
    sizeSqm: 28,
    amenities: [
      "Air conditioning and ceiling fan",
      "Ensuite bathroom with hot water",
      "Private veranda",
      "Tea and coffee",
      "Wi-Fi",
    ],
    images: [
      {
        src: "/images/resort/exterior-cottage-front.jpg",
        scene: "rooms.garden.1",
        alt: "The resort cottage opening directly onto the green garden.",
      },
      {
        src: "/images/resort/bedroom-queen-red.jpg",
        scene: "rooms.garden.2",
        alt: "Comfortable wooden double bed with garden view.",
      },
      {
        src: "/images/resort/bathroom-bidet-sink.jpg",
        scene: "rooms.garden.3",
        alt: "Ensuite bathroom with bidet and hot water.",
      },
    ],
    wing: "Garden Wing",
    sortOrder: 1,
  },
  {
    id: "deluxe-room",
    slug: "deluxe-room",
    name: "Deluxe Room",
    tagline: "A little more room to settle.",
    summary:
      "A larger room with a sitting corner, looking over the palm court.",
    description: [
      "The Deluxe Rooms face the palm court, a rectangle of shade at the centre of the property. They are a step larger than the Garden Rooms, with a sitting corner, a larger bed and a taller doorway that stays open to the courtyard air.",
      "Rooms on the upper floor have a deeper balcony; ground-floor rooms step directly onto the court.",
    ],
    baseRate: 2_450_000,
    maxAdults: 2,
    maxChildren: 2,
    maxOccupancy: 4,
    bedding: "King",
    sizeSqm: 34,
    amenities: [
      "Air conditioning and ceiling fan",
      "Sitting corner",
      "Ensuite bathroom with hot water",
      "Balcony or courtyard terrace",
      "Tea and coffee",
      "Wi-Fi",
    ],
    images: [
      {
        src: "/images/resort/family-bedroom-garden-view.jpg",
        scene: "rooms.deluxe.1",
        alt: "Deluxe room with seating corner and sunny windows.",
      },
      {
        src: "/images/resort/living-armchairs-cane.jpg",
        scene: "rooms.deluxe.2",
        alt: "Classic cane armchairs and traditional sitting corner.",
      },
      {
        src: "/images/resort/dining-table-seating.jpg",
        scene: "rooms.deluxe.3",
        alt: "Dining table and wooden chairs.",
      },
    ],
    wing: "Palm Court",
    sortOrder: 2,
  },
  {
    id: "palmyrah-cottage",
    slug: "palmyrah-cottage",
    name: "Palmyrah Cottage",
    tagline: "A cottage of your own.",
    summary:
      "A detached cottage with a broad veranda, set back among the trees.",
    description: [
      "Each cottage stands on its own, separated from its neighbours by garden rather than corridor. The roof is thatched in the local way, the veranda is deep, and the walls are thick enough to keep the afternoon heat at arm's length.",
      "Inside there is one generous room, a sitting area and a bathroom that opens to the garden. It suits couples who want a little distance from the rest of the property.",
    ],
    baseRate: 3_200_000,
    maxAdults: 3,
    maxChildren: 2,
    maxOccupancy: 4,
    bedding: "King",
    sizeSqm: 42,
    amenities: [
      "Detached cottage",
      "Broad private veranda",
      "Air conditioning and ceiling fan",
      "Outdoor seating",
      "Ensuite bathroom with hot water",
      "Tea and coffee",
      "Wi-Fi",
    ],
    images: [
      {
        src: "/images/resort/exterior-cottage-side.jpg",
        scene: "rooms.cottage.1",
        alt: "Detached cottage with veranda among the trees.",
      },
      {
        src: "/images/resort/bedroom-queen-ac.jpg",
        scene: "rooms.cottage.2",
        alt: "Cottage bedroom with queen bed and air-conditioning.",
      },
      {
        src: "/images/resort/bathroom-pedestal-sink.jpg",
        scene: "rooms.cottage.1",
        alt: "Cottage ensuite bathroom with toiletries.",
      },
    ],
    wing: "Cottages",
    sortOrder: 3,
  },
  {
    id: "family-suite",
    slug: "family-suite",
    name: "Family Suite",
    tagline: "Space for everyone.",
    summary:
      "Two bedrooms, one shared veranda — room for a family to spread out.",
    description: [
      "The Family Suites are built as two connected bedrooms around a small shared sitting room, with a veranda facing the garden. There is enough space for grandparents to travel with a family, or for children to have a room of their own.",
      "Beds can be arranged as two kings, or one king and two singles. A cot fits without crowding.",
    ],
    baseRate: 4_200_000,
    maxAdults: 4,
    maxChildren: 2,
    maxOccupancy: 6,
    bedding: "Two bedrooms; king and twins",
    sizeSqm: 58,
    amenities: [
      "Two bedrooms",
      "Shared sitting room",
      "Family veranda",
      "Air conditioning and ceiling fans",
      "Ensuite bathrooms with hot water",
      "Tea and coffee",
      "Wi-Fi",
    ],
    images: [
      {
        src: "/images/resort/family-room-two-queen-beds.jpg",
        scene: "rooms.family.1",
        alt: "Family Suite with two queen beds and air-conditioning.",
      },
      {
        src: "/images/resort/family-room-crib-cot.jpg",
        scene: "rooms.family.2",
        alt: "Family suite equipped with wooden crib and drying rack.",
      },
      {
        src: "/images/resort/living-room-sofa.jpg",
        scene: "rooms.family.1",
        alt: "Spacious family living area with sectional sofa.",
      },
    ],
    wing: "Family Wing",
    sortOrder: 4,
  },
  {
    id: "signature-villa",
    slug: "signature-villa",
    name: "Signature Villa",
    tagline: "The quietest address in the garden.",
    summary:
      "A separate villa with a living room, a private terrace and the long view west.",
    description: [
      "There are two Signature Villas, set furthest from the reception and closest to the western edge of the property. Each has a living room, a bedroom, a bathroom and a private terrace that catches the last of the light over the garden.",
      "It is the room to take when the point of the trip is to disappear for a few days. Breakfast can be served on the terrace; the rest of the resort is a short walk through the palms.",
    ],
    baseRate: 6_500_000,
    maxAdults: 2,
    maxChildren: 1,
    maxOccupancy: 3,
    bedding: "King",
    sizeSqm: 96,
    amenities: [
      "Separate living room",
      "Private terrace",
      "Outdoor seating",
      "Air conditioning and ceiling fan",
      "Ensuite bathroom with hot water",
      "Tea and coffee",
      "Wi-Fi",
    ],
    images: [
      {
        src: "/images/resort/exterior-garden-lawn.jpg",
        scene: "rooms.villa.1",
        alt: "Villa garden terrace looking onto native palmyrah palms.",
      },
      {
        src: "/images/resort/living-hall-overview.jpg",
        scene: "rooms.villa.2",
        alt: "Villa living hall with comfortable lounge and cane chairs.",
      },
      {
        src: "/images/resort/family-room-two-beds-ac.jpg",
        scene: "rooms.villa.3",
        alt: "Villa bedroom with quiet garden outlook and air-conditioning.",
      },
    ],
    wing: "Villas",
    sortOrder: 5,
  },
];

export const ROOM_TYPE_BY_SLUG = new Map(ROOM_TYPES.map((type) => [type.slug, type]));
export const ROOM_TYPE_BY_ID = new Map(ROOM_TYPES.map((type) => [type.id, type]));

export type Wing = {
  name: string;
  prefix: number;
  count: number;
  typeId: string;
};

export const WINGS: Wing[] = [
  { name: "Garden Wing", prefix: 100, count: 18, typeId: "garden-room" },
  { name: "Palm Court", prefix: 200, count: 14, typeId: "deluxe-room" },
  { name: "Cottages", prefix: 300, count: 8, typeId: "palmyrah-cottage" },
  { name: "Family Wing", prefix: 400, count: 4, typeId: "family-suite" },
  { name: "Villas", prefix: 500, count: 2, typeId: "signature-villa" },
];

export type Room = {
  id: string;
  number: string;
  roomTypeId: string;
  wing: string;
  floor: number;
  sortOrder: number;
  active: boolean;
};

export const ROOMS: Room[] = WINGS.flatMap((wing) =>
  Array.from({ length: wing.count }, (_, index) => {
    const number = wing.prefix + index + 1;
    const type = ROOM_TYPE_BY_ID.get(wing.typeId);
    return {
      id: `${type?.slug ?? wing.typeId}-${number}`,
      number: String(number),
      roomTypeId: wing.typeId,
      wing: wing.name,
      floor: Number(String(number)[0]),
      sortOrder: number,
      active: true,
    } satisfies Room;
  }),
);

export const ROOM_COUNT = ROOMS.length;

export const ROOMS_BY_TYPE = ROOM_TYPES.map((type) => ({
  ...type,
  rooms: ROOMS.filter((room) => room.roomTypeId === type.id),
}));

export function getRoomType(slug: string): RoomTypeContent | undefined {
  return ROOM_TYPE_BY_SLUG.get(slug);
}

export function getRoomById(id: string): Room | undefined {
  return ROOMS.find((room) => room.id === id);
}
