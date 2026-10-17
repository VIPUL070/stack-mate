import { SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { ReactNode } from "react";
import ThemeToggle from "@/components/theme-toggle";
import AppSidebar from "./app-sidebar";

type LayoutProps = {
    children : ReactNode
}

const SidebarLayout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar/>
      <main className="flex h-svh min-w-0 flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar p-2 px-4 shadow">
          <div className="ml-auto" />
          <ThemeToggle />
          <UserButton />
        </div>

        {/* main content */}
        <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto scrollbar-none rounded-md border border-sidebar-border bg-sidebar p-4 shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;