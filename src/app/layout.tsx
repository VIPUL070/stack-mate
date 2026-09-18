import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk } from 'next/font/google'
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import "./globals.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <Show when="signed-out">
              <SignInButton />
              <SignUpButton>
                <Button className="bg-purple-700 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </Button>
              </SignUpButton>
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