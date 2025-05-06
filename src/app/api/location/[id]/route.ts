import { db } from "@/lib/db";
import { locations } from "@/lib/db/schema";
import { handleErrorRoute } from "@/lib/handleRouteError";
import { createInsertSchema } from "drizzle-zod";
import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { takeUniqueOrThrow } from "@/utils/takeUniqueOrThrow";
import { deleteToMinio } from "@/lib/deleteToMinio";
import { uploadToMinio } from "@/lib/uploadToMinio";

const locationPatchSchema = createInsertSchema(locations).partial();

// GET: Fetch a single location by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(locations)
      .where(eq(locations.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    return handleErrorRoute(error);
  }
}

// PATCH: Update a location by ID
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const reqBody = await request.json();
    const { imageUrl, name, description } = locationPatchSchema
      .partial()
      .parse(reqBody);

    const existingItem = await db
      .select({
        imageUrl: locations.imageUrl,
      })
      .from(locations)
      .where(eq(locations.id, id))
      .then(takeUniqueOrThrow)
      .catch(() => null);
    // Validate input
    const updateData: Partial<typeof locations.$inferInsert> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (imageUrl != undefined) {
      if (existingItem?.imageUrl) {
        await deleteToMinio(existingItem.imageUrl);
      }
      const imageUrlKey = await uploadToMinio(imageUrl);
      updateData.imageUrl = imageUrlKey;
    }

    // Update location
    const result = await db
      .update(locations)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(locations.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("Error updating location:", error);
    return handleErrorRoute(error);
  }
}

// DELETE: Delete a location by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await db
      .delete(locations)
      .where(eq(locations.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Location deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting location:", error);
    return handleErrorRoute(error);
  }
}
