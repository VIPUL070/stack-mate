"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SIDEBAR_APP_ITEMS } from "@/constants/sidebar";
import { cn } from "cn";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDEBAR_PROJECT_ITEMS = [
  {
    name: "Project-1",
  },
  {
    name: "Project-2",
  },
  {
    name: "Project-3",
  },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="p-2 mb-2 font-semibold">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Image src="/logo.png" alt="logo" width={40} height={40} />
          </Link>
          {open && (
            <h1 className="text-xl font-semibold text-primary/80 ">
              Stack Mate
            </h1>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel
            className={cn("text-[0.9rem] text-primary tracking-wide")}
          >
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_APP_ITEMS.map((item) => {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className={cn(
                        {
                          "bg-active-primary! text-active-text!":
                            pathname === item.url,
                        },
                        "text-md"
                      )}
                      render={<Link href={item.url} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel
            className={cn("text-[0.9rem] text-primary tracking-wide")}
          >
            Your Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_PROJECT_ITEMS.map((item) => {
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton className={cn("cursor-pointer", {
                      "flex items-center justify-center" : !open
                    })}>
                      <div className="flex items-center justify-center gap-2 text-13px">
                        <div
                          className={cn(
                            "rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-active-primary",
                            {
                              "bg-active-primary! text-active-text!": true,
                            }
                          )}
                        >
                          {item.name[0]}
                        </div>
                        {open && <span>{item.name}</span>}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              <div className="h-2"></div>
              <SidebarMenuItem>
                <Link href="/create">
                  <Button
                    variant="outline"
                    className={cn("w-fit cursor-pointer")}
                  >
                    <Plus />
                    {open && <span>Create Project</span>}
                  </Button>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;