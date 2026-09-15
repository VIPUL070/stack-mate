import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Epilogue } from "next/font/google";
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StackMate",
  description: "",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className="dark"
    >
      <body className={cn("antialiased",  "font-epilogue", epilogue.variable)}>
        {children}
        </body>
    </html>
  );
}