import CategoryPages from "@/components/CategoryComponents/CategoryTable";
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Inventory() {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <>
      <CategoryPages />
    </>
  );
}
