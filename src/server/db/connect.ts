import "server-only";

import mongoose from "mongoose";

type Cache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongo = globalThis as typeof globalThis & {
  __palmyrahMongo?: Cache;
};

const cache: Cache =
  globalForMongo.__palmyrahMongo ??
  (globalForMongo.__palmyrahMongo = { connection: null, promise: null });

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

/**
 * One cached connection per serverless instance. `bufferCommands: false` makes
 * a missing connection fail loudly instead of hanging a request.
 */
export async function connectDb(): Promise<typeof mongoose> {
  if (cache.connection) return cache.connection;
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add your MongoDB Atlas connection string in Vercel.",
    );
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB ?? "palmyrah",
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 5_000,
        bufferCommands: false,
      })
      .then(async (instance) => {
        const admin = instance.connection.db?.admin();
        if (!admin) throw new Error("MongoDB connected without a database handle.");
        const hello = await admin.command({ hello: 1 });
        if (!hello.setName && hello.msg !== "isdbgrid") {
          throw new Error(
            "MongoDB must run as a replica set (Atlas does this by default): bookings rely on transactions and the unique room-night index.",
          );
        }
        cache.connection = instance;
        return instance;
      })
      .catch((error) => {
        cache.promise = null;
        throw error;
      });
  }

  return cache.promise;
}
