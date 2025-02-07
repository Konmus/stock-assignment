"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { Toaster } from "react-hot-toast";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
export default function ProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
