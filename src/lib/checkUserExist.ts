import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./db/schema";
import { takeUniqueOrThrow } from "@/utils/takeUniqueOrThrow";
import { NextResponse } from "next/server";

export const checkUserExist = async (id: string) => {
  const hi = await db
    .select()
    .from(users)
    .where(eq(users.id, `${id}`))
    .then(takeUniqueOrThrow);
  return hi;
};
