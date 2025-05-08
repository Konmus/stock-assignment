import { db } from "@/lib/db";
import { categories, items, locations, stock } from "@/lib/db/schema";
import { deleteToMinio } from "@/lib/deleteToMinio";
import { handleErrorRoute } from "@/lib/handleRouteError";
import { uploadToMinio } from "@/lib/uploadToMinio";
import { takeUniqueOrThrow } from "@/utils/takeUniqueOrThrow";
import { eq, sql } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const itemPatchSchema = createUpdateSchema(items).extend({
  imageUrl: z.any(),
});
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (req.nextUrl.searchParams.get("quantity")) {
      const quantityToAdd = Number(req.nextUrl.searchParams.get("quantity"));
      const stockTotal = await db
        .select({ quantity: stock.quantity })
        .from(stock)
        .where(eq(stock.inventoryItemId, id));
      const itemTotal = await db
        .select({ quantity: items.quantity })
        .from(items)
        .where(eq(items.id, id))
        .then(takeUniqueOrThrow)
        .catch(() => null);
      const total = stockTotal.reduce((acc, cur) => acc + cur.quantity, 0);
      const totalItem = itemTotal?.quantity ?? 0;
      const quantityLeft = totalItem - total;
      if (quantityLeft < 0) {
        return NextResponse.json(
          { status: 400 },
          {
            statusText:
              "Can't add stock larger then the total quantity of item",
          },
        );
      }
      return NextResponse.json(quantityLeft);
    }
    const result = await db
      .select({
        item: {
          id: items.id,
          name: items.name,
          quantity: items.quantity,
          categoryId: items.categoryId,
          supplier: items.supplier,
          supplierPhone: items.supplierPhone,
          imageUrl: items.imageUrl,
          price: items.price,
          createdAt: items.createdAt,
          updatedAt: items.updatedAt,
        },
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
        },
        stock: sql`(
          SELECT COALESCE(json_agg(json_build_object(
            'id', ${stock.id},
            'inventoryItemId', ${stock.inventoryItemId},
            'locationId', ${stock.locationId},
            'location', ${locations},
            'quantity', ${stock.quantity},
            'status', ${stock.status},
            'notes', ${stock.notes},
            'lastUpdated', ${stock.lastUpdated}
          )), '[]')
          FROM ${stock}
          LEFT JOIN ${locations} ON ${stock.locationId} = ${locations.id}
          WHERE ${stock.inventoryItemId} = ${items.id}
        )`.as("stock"),
      })
      .from(items)
      .leftJoin(categories, eq(items.categoryId, categories.id))
      .where(eq(items.id, id))
      .groupBy(
        items.id,
        items.name,
        items.quantity,
        items.categoryId,
        items.imageUrl,
        items.supplier,
        items.price,
        items.createdAt,
        items.updatedAt,
        categories.id,
        categories.name,
        categories.description,
        categories.createdAt,
        categories.updatedAt,
      )
      .then((rows) => {
        if (rows.length === 0) return null;
        const row = rows[0];
        return {
          ...row.item,
          category: row.category || null, // Handle null category
          stock: row.stock || [], // Ensure stock is an array
        };
      });
    return NextResponse.json(result);
  } catch (err) {
    return handleErrorRoute(err);
  }
}
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const requestBody = await request.json();

    // Validate input (using same schema, but all fields optional for PATCH)
    const {
      name,
      categoryId,
      supplier,
      supplierPhone,
      quantity,
      price,
      imageUrl,
    } = itemPatchSchema.partial().parse(requestBody);
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
    if (price !== undefined) updateData.price = price;
    if (supplierPhone !== undefined) updateData.supplierPhone = supplierPhone;
    if (supplier !== undefined) updateData.supplier = supplier;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

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
        categoryId: categoryId,
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
