import { usersTable } from "./schema";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";

const seedUsers = async (db: NodePgDatabase<Record<string, never>>) => {
  const userData: typeof usersTable.$inferInsert = {
    firstName: "test",
    lastName: "test",
    name: "test test",
    sex: "male",
    role: "admin",
    dob: "2000-10-10",
    password: await bcrypt.hash("testing", 10),
    email: "tester@gmail.com",
    username: "tester",
  };

  try {
    await db.delete(usersTable);
    await db.insert(usersTable).values(userData);

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, userData.username));

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
