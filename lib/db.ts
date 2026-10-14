import mongoose from "mongoose";
import { env } from "@/lib/env";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

// Cache the connection on globalThis so hot reloads in development (and repeated
// imports in tests) reuse one connection instead of opening a new pool each time.
const globalForMongoose = globalThis as unknown as { __mongoose?: Cache };
const cache: Cache = (globalForMongoose.__mongoose ??= { conn: null, promise: null });

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(env.mongodbUri, { serverSelectionTimeoutMS: 10_000 })
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
}
