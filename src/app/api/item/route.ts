import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { handleErrorRoute } from "@/lib/handleRouteError";
import { uploadToMinio } from "@/lib/uploadToMinio";
import { createInsertSchema } from "drizzle-zod";
import { NextResponse } from "next/server";
import { z } from "zod";

const itemPostSchema = createInsertSchema(items).extend({
  imageUrl: z.any(),
});
export async function GET() {
  try {
    const result = await db.select().from(items);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleErrorRoute(error);
  }
}
export async function POST(request: Request) {
  try {
    const requestBody = await request.json();

    // Validate input
    const { name, quantity, categoryId, price, imageUrl } =
      itemPostSchema.parse(requestBody);

    const imageUrlKey = await uploadToMinio(imageUrl);

    console.log(imageUrlKey);
    // Insert item into database
    const result = await db
      .insert(items)
      .values({
        name: name,
        quantity: quantity,
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
