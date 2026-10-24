/**
 * CR1 room catalogue: 46 rooms, split into AC and Non-AC comfort categories.
 *
 * The wing labels stay for orientation only. Rates, the exact AC/Non-AC split
 * and room-level photography still need the client's confirmation — TODO(client).
 */

export type RoomCategoryId = "ac" | "non_ac";

export type RoomPhoto = {
  src: string;
  alt: string;
};

export type RoomCategoryContent = {
  id: RoomCategoryId;
  label: string;
  shortLabel: string;
  tagline: string;
  description: string;
  amenities: string[];
  photos: RoomPhoto[];
  href: string;
  /** Pre-written call-to-action so article grammar stays correct ("an" vs "a"). */
  ctaLabel: string;
};

export const ROOM_CATEGORIES: RoomCategoryContent[] = [
  {
    id: "ac",
    label: "Air-conditioned rooms",
    shortLabel: "AC",
    tagline: "Cool, quiet, ready when the afternoon gets hot.",
    description:
      "Air-conditioned rooms with the same ensuite, bed and simple furniture as the rest of the resort. Cooling is switched on whenever you want it.",
    amenities: [
      "Air conditioning and ceiling fan",
      "Ensuite bathroom with hot water",
      "King or twin beds",
      "Tea and coffee",
      "Wi-Fi",
    ],
    photos: [
      {
        src: "/images/rooms/ac-room-01.jpg",
        alt: "An air-conditioned room with a double bed, a single bed and a mirror.",
      },
      {
        src: "/images/rooms/ac-room-02.jpg",
        alt: "An air-conditioned double room with a wooden bed and warm windows.",
      },
      {
        src: "/images/rooms/ac-room-03.jpg",
        alt: "An air-conditioned room with a double bed and a single bed beside it.",
      },
    ],
    href: "/rooms?category=ac",
    ctaLabel: "Request an AC room",
  },
  {
    id: "non_ac",
    label: "Non-AC rooms",
    shortLabel: "Non-AC",
    tagline: "Fan-cooled, low-walled rooms that keep the garden close.",
    description:
      "Rooms with a ceiling fan and high windows that let the garden breeze through. The rest of the stay is identical to the AC rooms.",
    amenities: [
      "Ceiling fan",
      "High windows for the garden breeze",
      "Ensuite bathroom with hot water",
      "King or twin beds",
      "Tea and coffee",
      "Wi-Fi",
    ],
    photos: [
      {
        src: "/images/rooms/non-ac-room-01.jpg",
        alt: "A fan-cooled room with a red bedspread and wooden furniture.",
      },
      {
        src: "/images/rooms/non-ac-room-02.jpg",
        alt: "A quiet fan-cooled room with a single bed and a small table.",
      },
      {
        src: "/images/rooms/non-ac-room-03.jpg",
        alt: "A fan-cooled family room with a double bed and two single beds.",
      },
    ],
    href: "/rooms?category=non_ac",
    ctaLabel: "Request a non-AC room",
  },
];

export const ROOM_CATEGORY_BY_ID = new Map(
  ROOM_CATEGORIES.map((category) => [category.id, category]),
);

export const ROOM_CATEGORY_IDS = ROOM_CATEGORIES.map((category) => category.id);

export function getRoomCategoryById(
  id: RoomCategoryId,
): RoomCategoryContent | undefined {
  return ROOM_CATEGORY_BY_ID.get(id);
}

export function isRoomCategoryId(value: string | null): value is RoomCategoryId {
  return value === "ac" || value === "non_ac";
}

export type BoardRoom = {
  number: string;
  wing: string;
  category: RoomCategoryId;
  bedCount: number;
  bedType: string;
  sizeSqm: number;
  maxAdults: number;
  maxChildren: number;
  amenities: string[];
  photos: RoomPhoto[];
};

const WINGS: { name: string; first: number; count: number; category: RoomCategoryId }[] = [
  { name: "Garden Wing", first: 1, count: 12, category: "non_ac" },
  { name: "Palm Court", first: 13, count: 12, category: "ac" },
  { name: "Cottages", first: 25, count: 8, category: "ac" },
  { name: "Family Wing", first: 33, count: 8, category: "ac" },
  { name: "Villas", first: 41, count: 6, category: "ac" },
];

export const BOARD_ROOMS: BoardRoom[] = WINGS.flatMap((wing) =>
  Array.from({ length: wing.count }, (_, index) => {
    const number = String(wing.first + index).padStart(2, "0");
    const category = getRoomCategoryById(wing.category);
    if (!category) throw new Error(`Missing room category: ${wing.category}`);

    return {
      number,
      wing: wing.name,
      category: wing.category,
      bedCount: 1,
      bedType: "King",
      sizeSqm: 28,
      maxAdults: 2,
      maxChildren: 1,
      amenities: category.amenities,
      photos: category.photos,
    } satisfies BoardRoom;
  }),
);

export const BOARD_ROOM_COUNTS = BOARD_ROOMS.reduce(
  (counts, room) => {
    counts[room.category] += 1;
    return counts;
  },
  { ac: 0, non_ac: 0 } as Record<RoomCategoryId, number>,
);

export const BOARD_ROOM_BY_NUMBER = new Map(
  BOARD_ROOMS.map((room) => [room.number, room]),
);

export const ROOM_NUMBERS = BOARD_ROOMS.map((room) => room.number);
export const BOARD_ROOM_COUNT = BOARD_ROOMS.length;

export const ROOM_NUMBER_PATTERN = /^(0[1-9]|[1-3][0-9]|4[0-6])$/;

export function isRoomNumber(value: string): boolean {
  return ROOM_NUMBER_PATTERN.test(value);
}

export function getBoardRoom(number: string): BoardRoom | undefined {
  return BOARD_ROOM_BY_NUMBER.get(number);
}

export function getRoomCategoryId(roomNumber: string): RoomCategoryId {
  return getBoardRoom(roomNumber)?.category ?? "non_ac";
}

export function getRoomCategory(roomNumber: string): RoomCategoryContent | undefined {
  return getRoomCategoryById(getRoomCategoryId(roomNumber));
}
