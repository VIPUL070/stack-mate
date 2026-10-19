"use client";

import { useLayoutEffect } from "react";

export default function ForceLight() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");

    const strip = () => {
      if (root.classList.contains("dark")) root.classList.remove("dark");
      root.style.colorScheme = "light";
    };

    strip();
    // next-themes can re-add "dark", so strip it again whenever it does
    const observer = new MutationObserver(strip);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      root.style.colorScheme = "";
      if (hadDark) root.classList.add("dark"); // restore dark mode for other pages
    };
  }, []);

  return null;
}