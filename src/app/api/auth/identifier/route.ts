import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { users } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { handleErrorRoute } from "@/lib/handleRouteError";

const identifierSchema = z.object({
  username: z.string().min(3).max(255),
  email: z.string().email(),
});

// POST: Check username and email availability
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = identifierSchema.parse(body);

    // Check if username exists
    const existingUserByUsername = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, validatedData.username))
      .limit(1);

    if (existingUserByUsername.length > 0) {
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 404 },
      );
    }

    // Check if email exists
    const existingUserByEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUserByEmail.length > 0) {
      return NextResponse.json(
        { message: "Email already taken" },
        { status: 400 },
      );
    }

    // Both username and email are available
    return NextResponse.json({ status: 200 });
  } catch (error) {
    return handleErrorRoute(error);
  }
}
