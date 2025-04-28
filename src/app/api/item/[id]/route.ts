import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { deleteToMinio } from "@/lib/deleteToMinio";
import { handleErrorRoute } from "@/lib/handleRouteError";
import { uploadToMinio } from "@/lib/uploadToMinio";
import { takeUniqueOrThrow } from "@/utils/takeUniqueOrThrow";
import { eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import { NextResponse } from "next/server";
import { z } from "zod";

const itemPatchSchema = createUpdateSchema(items).extend({
  imageUrl: z.any(),
});
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const requestBody = await request.json();

    // Validate input (using same schema, but all fields optional for PATCH)
    const { name, quantity, category, price, imageUrl } = itemPatchSchema
      .partial()
      .parse(requestBody);
    const existingItem = await db
      .select({
        imageUrl: items.imageUrl,
      })
      .from(items)
      .where(eq(items.id, id))
      .then(takeUniqueOrThrow)
      .catch(() => null);

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updateData: Partial<typeof items.$inferInsert> = {};
    if (name !== undefined) updateData.name = name;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = price;

    if (imageUrl != undefined) {
      if (existingItem.imageUrl) {
        await deleteToMinio(existingItem.imageUrl);
      }
      const imageUrlKey = await uploadToMinio(imageUrl);
      updateData.imageUrl = imageUrlKey;
    }

    const result = await db
      .update(items)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(items.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.log(error);
    return handleErrorRoute(error);
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check if item exists and get its imageUrl
    const existingItem = await db
      .select({
        imageUrl: items.imageUrl,
      })
      .from(items)
      .where(eq(items.id, id))
      .then(takeUniqueOrThrow)
      .catch(() => null);

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete image from MinIO if it exists
    if (existingItem.imageUrl) {
      await deleteToMinio(existingItem.imageUrl);
    }

    // Delete item from database
    await db.delete(items).where(eq(items.id, id));

    return NextResponse.json(
      { message: "Item deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return handleErrorRoute(error);
  }
}
