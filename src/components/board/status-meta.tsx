import {
  BedDouble,
  Check,
  Clock3,
  KeyRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { RoomBoardState } from "@/lib/prototype/types";

export const ADMIN_STATUS_ORDER: RoomBoardState[] = [
  "available",
  "pending",
  "booked",
  "in_house",
  "blocked",
];

export const GUEST_STATUS_ORDER: RoomBoardState[] = [
  "available",
  "pending",
  "booked",
];

export const STATUS_META: Record<
  RoomBoardState,
  {
    label: string;
    icon: LucideIcon;
    tile: string;
    dot: string;
  }
> = {
  available: {
    label: "Available",
    icon: Check,
    tile: "bg-[var(--status-free)] text-ink",
    dot: "bg-[var(--status-free)]",
  },
  pending: {
    label: "Pending",
    icon: Clock3,
    tile: "bg-[var(--status-pending)] text-ink",
    dot: "bg-[var(--status-pending)]",
  },
  booked: {
    label: "Booked",
    icon: KeyRound,
    tile: "bg-[var(--status-booked)] text-salt",
    dot: "bg-[var(--status-booked)]",
  },
  in_house: {
    label: "In house",
    icon: BedDouble,
    tile: "bg-[var(--status-inhouse)] text-salt",
    dot: "bg-[var(--status-inhouse)]",
  },
  blocked: {
    label: "Blocked",
    icon: Wrench,
    tile: "bg-[var(--status-blocked)] text-salt",
    dot: "bg-[var(--status-blocked)]",
  },
};
