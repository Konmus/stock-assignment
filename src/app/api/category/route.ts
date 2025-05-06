import { db } from "@/lib/db";
import { categories, items } from "@/lib/db/schema";
import { handleErrorRoute } from "@/lib/handleRouteError";
import { uploadToMinio } from "@/lib/uploadToMinio";
import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const categoryPostSchema = createInsertSchema(categories).extend({});

// GET: Fetch all categories
export async function GET(req: NextRequest) {
  try {
    if (Boolean(req.nextUrl.searchParams.get("selectOption")) == true) {
      const result = await db
        .select({
          id: categories.id,
          name: categories.name,
        })
        .from(categories);
      const selectOptions = result.map((i) => ({
        label: i.name,
        value: i.id,
      }));
      return NextResponse.json(selectOptions);
    }
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        itemCount: sql<number>`COUNT(${items.id})`.as("itemCount"),
      })
      .from(categories)
      .leftJoin(items, eq(items.categoryId, categories.id))
      .groupBy(categories.id);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleErrorRoute(error);
  }
}

// POST: Create a new category
export async function POST(request: Request) {
  try {
    const requestBody = await request.json();

    // Validate input
    const { name, description } = categoryPostSchema.parse(requestBody);

    // Insert category into database
    const result = await db
      .insert(categories)
      .values({
        name,
        description,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return handleErrorRoute(error);
  }
}
