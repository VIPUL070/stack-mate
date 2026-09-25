import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";
import { ClerkProvider, Show } from "@clerk/nextjs";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import DynamicIslandToast from "@/components/dynamic-island-toast";
import { TRPCReactProvider } from "@/trpc/react";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-primary",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StackMate",
  description: " Autonomous AI Developer for GitHub",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn("antialiased", "font-primary", spaceGrotesk.variable)}
      >
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Show when="signed-out"></Show>
            <Show when="signed-in"></Show>
            <TooltipProvider>
              <TRPCReactProvider>{children}</TRPCReactProvider>
              <DynamicIslandToast />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
