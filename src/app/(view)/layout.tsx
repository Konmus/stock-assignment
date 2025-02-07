import { auth } from "@/lib/auth";
import React from "react";
import { Toaster } from "react-hot-toast";
import { AppSidebar } from "@/components/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  console.log(session, "session");
  return (
    <>
      <SidebarProvider>
        <AppSidebar session={session} />
        <SidebarTrigger />
        {children}
        <Toaster position="bottom-right" />
      </SidebarProvider>
    </>
  );
}
