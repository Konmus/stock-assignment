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
const updateUserSchema = createUpdateSchema(users);
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

// PUT: Update a user
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const validatedData = updateUserSchema.parse(updateData);

    const [updatedUser] = await db
      .update(users)
      .set(validatedData)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleErrorRoute(error);
  }
}
