import { db } from "@/lib/db";
import { locations } from "@/lib/db/schema";
import { handleErrorRoute } from "@/lib/handleRouteError";
import { createInsertSchema } from "drizzle-zod";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ilike } from "drizzle-orm";
import { uploadToMinio } from "@/lib/uploadToMinio";

const locationPostSchema = createInsertSchema(locations).extend({
  imageUrl: z.any(),
});

// GET: Fetch all locations or filter by name query parameter
export async function GET(req: NextRequest) {
  try {
    if (Boolean(req.nextUrl.searchParams.get("selectOption")) == true) {
      const result = await db
        .select({
          id: locations.id,
          name: locations.name,
        })
        .from(locations);
      const selectOptions = result.map((i) => ({
        label: i.name,
        value: i.id,
      }));
      return NextResponse.json(selectOptions);
    }
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    const query = db.select().from(locations);
    if (name) {
      query.where(ilike(locations.name, `%${name}%`));
    }

    const result = await query;
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleErrorRoute(error);
  }
}

// POST: Create a new location
export async function POST(request: Request) {
  try {
    const requestBody = await request.json();

    // Validate input
    const { name, description, imageUrl } =
      locationPostSchema.parse(requestBody);
    const imageUrlKey = await uploadToMinio(imageUrl);

    // Insert location into database
    const result = await db
      .insert(locations)
      .values({
        name,
        description,
        imageUrl: imageUrlKey,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating location:", error);
    return handleErrorRoute(error);
  }
}
