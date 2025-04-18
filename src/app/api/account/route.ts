import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { users } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { noPassUser } from "@/lib/userSelect";
import { handleErrorRoute } from "@/lib/handleRouteError";
// Initialize database connection

// Validation schemas
const createUserSchema = createInsertSchema(users);
// GET: Fetch all users
export async function GET() {
  try {
    const allUsers = await db.select(noPassUser).from(users);
    return NextResponse.json(allUsers);
  } catch (error) {
    return handleErrorRoute(error);
  }
}

// POST: Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    const [newUser] = await db
      .insert(users)
      .values({
        username: validatedData.username,
        email: validatedData.email,
        name: validatedData.name,
        password: validatedData.password, // In production, hash the password
        role: validatedData.role,
      })
      .returning();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return handleErrorRoute(error);
  }
}
