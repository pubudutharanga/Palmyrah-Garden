import type { Metadata } from "next";
import { Suspense } from "react";

import { GuestRoomBoard } from "@/components/board/guest-room-board";

export const metadata: Metadata = {
  title: "Rooms and live availability",
  description:
    "See all 46 AC and non-AC rooms at The Palmyrah Garden & Resort, pick a time window and request the room you want.",
};

function BoardFallback() {
  return (
    <div className="min-h-svh pt-20">
      <div className="border-b border-dune bg-salt">
        <div className="shell py-4">
          <div className="h-8 w-52 animate-pulse rounded bg-dune/70" />
          <div className="mt-3 h-10 w-full max-w-xl animate-pulse rounded-full bg-dune/70" />
        </div>
      </div>
      <div className="shell py-4">
        <div className="grid grid-cols-4 border-l border-t border-ink/15 sm:grid-cols-6 lg:grid-cols-9">
          {Array.from({ length: 46 }, (_, index) => (
            <div
              key={index}
              className="min-h-[clamp(64px,9.5vh,96px)] animate-pulse border-b border-r border-ink/15 bg-dune/60"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<BoardFallback />}>
      <GuestRoomBoard />
    </Suspense>
  );
}
