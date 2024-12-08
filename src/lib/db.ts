import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./db/schema";
import { Pool } from "pg";

//Singleton for db client
//
//
//
declare global {
  // eslint-disable-next-line no-unused-vars, no-var
  var cachedDrizzle: NodePgDatabase;
}

let drizzleClient: NodePgDatabase;
if (process.env.NODE_ENV === "production") {
  drizzleClient = drizzle(process.env.DATABASE_URL!);
} else {
  if (!global.cachedDrizzle) {
    global.cachedDrizzle = drizzle(process.env.DATABASE_URL!);
  }
  drizzleClient = global.cachedDrizzle;
}

export const db = drizzleClient;
