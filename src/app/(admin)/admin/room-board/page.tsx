import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminRoomBoard } from "@/components/admin/admin-room-board";

export const metadata: Metadata = {
  title: "Room board",
};

export default function AdminRoomBoardPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-6 lg:px-8">
          <div className="h-9 w-56 animate-pulse rounded bg-dune/70" />
          <div className="mt-4 h-10 w-full max-w-xl animate-pulse rounded-full bg-dune/70" />
          <div className="mt-5 h-96 animate-pulse rounded bg-dune/50" />
        </div>
      }
    >
      <AdminRoomBoard />
    </Suspense>
  );
}
