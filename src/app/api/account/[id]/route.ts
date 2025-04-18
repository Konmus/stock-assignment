import { checkUserExist } from "@/lib/checkUserExist";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { handleErrorRoute } from "@/lib/handleRouteError";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json("");
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await db.transaction(async (tx) => {
      await checkUserExist(id);
      await tx
        .delete(users)
        .where(eq(users.id, `${id}`))
        .returning();
    });
    return NextResponse.json("Deleted Successfully");
  } catch (err) {
    return handleErrorRoute(err);
  }
}
