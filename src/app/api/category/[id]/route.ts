import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { handleErrorRoute } from "@/lib/handleRouteError";
import { uploadToMinio } from "@/lib/uploadToMinio";
import { createInsertSchema } from "drizzle-zod";
import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

const categoryPatchSchema = createInsertSchema(categories).extend({}).partial();

// GET: Fetch a single category by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    return handleErrorRoute(error);
  }
}

// PATCH: Update a category by ID
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const requestBody = await request.json();

    // Validate input
    const { name, description } = categoryPatchSchema.parse(requestBody);

    // Update category
    const result = await db
      .update(categories)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return handleErrorRoute(error);
  }
}

// DELETE: Delete a category by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return handleErrorRoute(error);
  }
}
