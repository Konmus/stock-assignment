"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { SidebarProvider } from "../ui/sidebar";
export default function ProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SessionProvider>{children}</SessionProvider>
    </SidebarProvider>
  );
}
