import { checkUserExist } from "@/lib/checkUserExist";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { handleErrorRoute } from "@/lib/handleRouteError";
import { eq } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import { NextRequest, NextResponse } from "next/server";

const updateUserSchema = createUpdateSchema(users);
export async function GET() {
  return NextResponse.json("");
}
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validateData = updateUserSchema.parse(body);
    await checkUserExist(id);
    const [updatedUser] = await db
      .update(users)
      .set(validateData)
      .where(eq(users.id, id))
      .returning({
        username: users.username,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        role: users.role,
      });
    return NextResponse.json(updatedUser);
  } catch (err) {
    return handleErrorRoute(err);
  }
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
