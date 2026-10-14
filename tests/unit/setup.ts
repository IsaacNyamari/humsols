import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll } from "vitest";
import { disconnectDB } from "@/lib/db";
import { setMailSenderForTests } from "@/lib/mail/transport";
import { resetRateLimits } from "@/lib/rate-limit";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 90_000 } });
  process.env.MONGODB_URI = mongo.getUri("humsols_test");
  process.env.MAIL_DRIVER = "log";
});

afterEach(async () => {
  setMailSenderForTests(null);
  resetRateLimits();
  if (mongoose.connection.readyState === 1) {
    const collections = await mongoose.connection.db!.collections();
    await Promise.all(collections.map((c) => c.deleteMany({})));
  }
});

afterAll(async () => {
  await disconnectDB();
  await mongo?.stop();
});
