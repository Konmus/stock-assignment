import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { handleErrorRoute } from "@/lib/handleRouteError";
import { uploadToMinio } from "@/lib/uploadToMinio";
import { ilike } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const itemPostSchema = createInsertSchema(items).extend({
  imageUrl: z.any(),
});
export async function GET(req: NextRequest) {
  try {
    //const result = await db.select().from(items);
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    const query = db.select().from(items);
    if (name) {
      query.where(ilike(items.name, `%${name}%`));
    }
    const result = await query;
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleErrorRoute(error);
  }
}
export async function POST(request: Request) {
  try {
    const requestBody = await request.json();

    // Validate input
    const {
      name,
      quantity,
      supplier,
      supplierPhone,
      categoryId,
      price,
      imageUrl,
    } = itemPostSchema.parse(requestBody);

    const imageUrlKey = await uploadToMinio(imageUrl);

    console.log(imageUrlKey);
    // Insert item into database
    const result = await db
      .insert(items)
      .values({
        name: name,
        quantity: quantity,
        supplier,
        supplierPhone,
        price: price,
        imageUrl: imageUrlKey,
        categoryId: categoryId,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.log(error);
    return handleErrorRoute(error);
  }
}
