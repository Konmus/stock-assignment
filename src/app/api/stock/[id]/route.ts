import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stock } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { handleErrorRoute } from "@/lib/handleRouteError";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const result = await db.select().from(stock).where(eq(stock.id, params.id));
    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    return handleErrorRoute(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const requestBody = await req.json();

    const updatedStock = await db
      .update(stock)
      .set(requestBody)
      .where(eq(stock.id, params.id))
      .returning();

    return NextResponse.json(updatedStock[0], { status: 200 });
  } catch (error) {
    return handleErrorRoute(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await db.delete(stock).where(eq(stock.id, params.id));
    return NextResponse.json(
      { message: "Stock deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return handleErrorRoute(error);
  }
}
