"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Simple } from "./ui/simple";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [toggled , setToggled] = useState<boolean>(false)

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div 
        className="h-9 w-9 rounded-full border border-neutral-200 dark:border-neutral-800" 
        aria-hidden="true" 
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      className="inline-flex h-9 w-9 items-center justify-center cursor-pointer rounded-full border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
    >
      <Simple
        toggled={toggled}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}

        onClick={() => {
          setToggled((value) => !value);
          setTheme(isDark ? "light" : "dark")
        }}
      />
    </button>
  );
}