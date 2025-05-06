import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stock } from "@/lib/db/schema";
import { handleErrorRoute } from "@/lib/handleRouteError";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const stockPostSchema = createInsertSchema(stock);

export async function GET() {
  try {
    const result = await db.select().from(stock);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleErrorRoute(error);
  }
}

export async function POST(request: Request) {
  try {
    const requestBody = await request.json();

    // Validate input
    const validData = stockPostSchema.parse(requestBody);

    // Insert stock into database
    const result = await db.insert(stock).values(validData).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.log(error);
    return handleErrorRoute(error);
  }
}
