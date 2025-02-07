"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { MdHome, MdOutlineInventory2 } from "react-icons/md";
import { NavUser } from "./SidebarFooter";
import { Session } from "next-auth";

const items = [
  {
    title: "Home",
    url: "/",
    icon: <MdHome />,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: <MdOutlineInventory2 />,
  },
];

interface AppSideBarProps {
  session: Session | null;
}

export function AppSidebar({ session }: AppSideBarProps) {
  const path = usePathname();
  console.log(path);
  return (
    <Sidebar>
      <SidebarHeader className="m-4 text-xl font-medium flex justify-center items-center">
        Stock Management
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={cn(
                        path == item.url ? "bg-sidebar-accent" : "",
                      )}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser session={session} />
      </SidebarFooter>
    </Sidebar>
  );
}
