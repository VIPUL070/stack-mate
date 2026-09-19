import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk } from 'next/font/google'
import { ClerkProvider, Show, UserButton } from '@clerk/nextjs'
import "./globals.css";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-primary', 
  display: 'swap',
})

export const metadata: Metadata = {
  title: "StackMate",
  description: "",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("antialiased",  "font-primary", spaceGrotesk.variable)}
    >
      <body >
        <ClerkProvider>
          <header className="flex justify-end items-center">
            <Show when="signed-out">
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          {children}
        </ClerkProvider>
        </body>
    </html>
  );
}