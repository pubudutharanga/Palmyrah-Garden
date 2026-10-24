import { ROOMS, ROOM_TYPES } from "@/content/rooms";
import { connectDb } from "@/server/db/connect";
import { RoomNightModel } from "@/server/db/models";
import { storeMode } from "@/server/store";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store, max-age=0",
  "x-request-id": crypto.randomUUID(),
};

export async function GET() {
  const mode = storeMode();
  const basics = {
    rooms: { total: ROOMS.length, active: ROOMS.length },
    roomTypes: ROOM_TYPES.length,
    prototypeMode: process.env.NEXT_PUBLIC_PROTOTYPE_MODE !== "false",
    timezone: "Asia/Colombo",
  };

  if (mode === "demo") {
    return Response.json(
      {
        ok: true,
        data: {
          status: "ok",
          store: "demo",
          note: "No MONGODB_URI set. Availability uses deterministic sample data and bookings live for the life of this serverless instance.",
          ...basics,
        },
      },
      { headers },
    );
  }

  try {
    const instance = await connectDb();
    const db = instance.connection.db;
    if (!db) throw new Error("No database handle.");
    await db.admin().command({ ping: 1 });

    let indexes: { roomNightUnique: boolean } = { roomNightUnique: false };
    try {
      const existing = await RoomNightModel.collection.indexes();
      indexes = {
        roomNightUnique: existing.some(
          (index) =>
            index.unique === true &&
            index.key.roomId === 1 &&
            index.key.night === 1,
        ),
      };
    } catch {
      indexes = { roomNightUnique: false };
    }

    const healthy = indexes.roomNightUnique;

    return Response.json(
      {
        ok: healthy,
        data: healthy
          ? { status: "ok", store: "mongo", database: db.databaseName, indexes, ...basics }
          : {
              status: "degraded",
              store: "mongo",
              database: db.databaseName,
              indexes,
              message: "Critical room-night index is missing. Run pnpm db:indexes.",
              ...basics,
            },
      },
      { status: healthy ? 200 : 503, headers },
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "INTERNAL",
          message:
            error instanceof Error
              ? error.message
              : "MongoDB is not reachable.",
        },
      },
      { status: 503, headers },
    );
  }
}
