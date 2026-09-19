import { SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { ReactNode } from "react";
import ThemeToggle from "@/components/theme-toggle";
import AppSidebar from "./app-sidebar";

type LayoutProps = {
    children : ReactNode
}

const SidebarLayout = ({children}: LayoutProps) => {
  return (
    <SidebarProvider>
        <AppSidebar />
        <main className="w-full m-4">
           <div className="flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4">
              {/* <SearchBar /> */}
              <div className="ml-auto" />
              <ThemeToggle />
              <UserButton />
           </div>
           <div className="h-4" />
           
           {/* main content  */}
           <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll scrollbar-none h-[calc(100vh-6rem)] p-4">
              {children}
           </div>
        </main>
    </SidebarProvider>
  )
}

export default SidebarLayout;