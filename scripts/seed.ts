import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { seed } = await import("@/lib/seed");
  const { connectDB, disconnectDB } = await import("@/lib/db");
  const { User } = await import("@/models");

  const email = process.env.SEED_OWNER_EMAIL;
  const password = process.env.SEED_OWNER_PASSWORD;

  await connectDB();
  const hasOwner = Boolean(await User.exists({ role: "owner" }));
  if (!email || !password) {
    if (!hasOwner) {
      console.error(
        "No owner account exists yet. Set SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD and run the seed again.",
      );
      await disconnectDB();
      process.exit(1);
    }
    console.log("SEED_OWNER_* not set — an owner already exists, skipping user creation.");
  } else if (password.length < 10) {
    console.error("SEED_OWNER_PASSWORD must be at least 10 characters.");
    await disconnectDB();
    process.exit(1);
  }

  await seed({
    users: email && password ? [{ name: "Owner", email, password, role: "owner" }] : [],
  });
  await disconnectDB();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
