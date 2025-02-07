import { users } from "./schema";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";

const seedUsers = async (db: NodePgDatabase<Record<string, never>>) => {
  const userData: typeof users.$inferInsert = {
    name: "test test",
    role: "admin",
    password: await bcrypt.hash("test", 10),
    email: "tester@gmail.com",
    username: "tester",
  };

  try {
    await db.delete(users);
    await db.insert(users).values(userData);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, userData.username));

    console.log(users);
  } catch (err) {
    console.error("Something went wrong...");
    console.error(err);
  }
};

const main = async () => {
  console.log("🧨 Started seeding the database...\n");
  const db = drizzle(process.env.DATABASE_URL!);
  await seedUsers(db);
  console.log("\n🧨 Done seeding the database successfully...\n");
};
main();
