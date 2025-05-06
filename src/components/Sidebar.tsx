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

export const navItems = [
  {
    title: "Overview",
    url: "/overview",
    buttonPlaceholder: null,
    hasPlaceholder: false,
    icon: <MdHome />,
  },
  {
    title: "Item",
    url: "/item",
    buttonPlaceholder: "Add Item",
    buttonPlaceholderEdit: "Edit Item",
    hasPlaceholder: true,
    icon: <MdOutlineInventory2 />,
  },
  {
    title: "Location",
    url: "/location",
    buttonPlaceholder: "Add Location",
    buttonPlaceholderEdit: "Edit Location",
    hasPlaceholder: true,
    icon: <MdOutlineInventory2 />,
  },
  {
    title: "Category",
    url: "/category",
    buttonPlaceholder: "Add Category",
    buttonPlaceholderEdit: "Edit Category",
    hasPlaceholder: true,
    icon: <MdOutlineInventory2 />,
  },
  {
    title: "User",
    url: "/user",
    buttonPlaceholder: "Add User",
    buttonPlaceholderEdit: "Edit User",
    hasPlaceholder: true,
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
              {navItems.map((item) => (
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
