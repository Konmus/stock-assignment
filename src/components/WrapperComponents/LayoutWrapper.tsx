"use client";
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
import React from "react";
import { AppSidebar, navItems } from "../Sidebar";
import { Session } from "next-auth";
import { useParams, usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { UserModal } from "../UserComponents/UserModal";
import { ItemModal } from "../ItemComponents/ItemModal";
export const LayoutWrapper = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) => {
  const [isModalOpen, setModalOpen] = React.useState(false);
  const pathName = usePathname();
  const queryParams = useParams();
  console.log(pathName);
  return (
    <>
      <AppSidebar session={session} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3 w-full justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {navItems.map(({ title, url }) => {
                    return (
                      <React.Fragment key={url}>
                        {pathName.includes(url) && (
                          <>
                            {pathName.includes(url) && (
                              <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">
                                  {title}
                                </BreadcrumbLink>
                              </BreadcrumbItem>
                            )}
                            {pathName === `${url}/${queryParams}` &&
                              queryParams.id && (
                                <>
                                  <BreadcrumbSeparator className="hidden md:block" />
                                  <BreadcrumbItem>
                                    <BreadcrumbPage>
                                      {queryParams.id}
                                    </BreadcrumbPage>
                                  </BreadcrumbItem>
                                </>
                              )}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            {navItems.map(({ url, hasPlaceholder, buttonPlaceholder }) => {
              return (
                <React.Fragment key={url}>
                  {pathName.includes(url) && hasPlaceholder && (
                    <Button onClick={() => setModalOpen(true)}>
                      {buttonPlaceholder}
                    </Button>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </header>
        <div className="p-4">{children}</div>
      </SidebarInset>
      {pathName.includes("/user") && (
        <UserModal
          isModalOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
      {pathName.includes("/item") && (
        <ItemModal
          isModalOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};
