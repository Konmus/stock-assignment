import { getTableColumns } from "drizzle-orm";
import { users } from "./db/schema";

export const { password, ...noPassUser } = getTableColumns(users);
