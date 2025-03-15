import { auth } from "@/lib/auth";
import React from "react";
import { Toaster } from "react-hot-toast";
import { AppSidebar, navItems } from "@/components/Sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LayoutWrapper } from "@/components/WrapperComponents/LayoutWrapper";
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
        <LayoutWrapper session={session}>
          {children}
          <Toaster position="bottom-right" />
        </LayoutWrapper>
      </SidebarProvider>
    </>
  );
}
