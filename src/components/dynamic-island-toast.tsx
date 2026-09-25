"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, Loader2, X } from "lucide-react";
import { ToastItem } from "@/types/toast-type";
import { islandToast } from "@/lib/toast";


const iconMap = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
  error: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />,
  info: <Info className="w-4 h-4 text-sky-400 shrink-0" />,
  loading: <Loader2 className="w-4 h-4 text-neutral-300 animate-spin shrink-0" />,
};

export default function DynamicIslandToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return islandToast.subscribe(setToasts);
  }, []);

  const activeToast = toasts[0];

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-9999 pointer-events-none flex flex-col items-center">
      <AnimatePresence mode="wait">
        {activeToast && (
          <motion.div
            key={activeToast.id}
            layout
            initial={{ scale: 0.7, y: -30, opacity: 0, filter: "blur(8px)" }}
            animate={{ scale: 1, y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.8, y: -25, opacity: 0, filter: "blur(6px)" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.7, bottom: 0.1 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -20) {
                islandToast.dismiss(activeToast.id);
              }
            }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 30,
              mass: 0.8,
            }}
            className="pointer-events-auto cursor-grab relative flex items-center gap-3.5 px-4 py-2.5 bg-black/95 text-white rounded-full border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-2xl max-w-[calc(100vw-32px)] sm:max-w-md"
          >
            {/* Morphing status icon with subtle glow */}
            <div className="relative flex items-center justify-center">
              {activeToast.type && (
                <div
                  className={`absolute -inset-1 rounded-full blur-[6px] opacity-40 ${
                    activeToast.type === "success"
                      ? "bg-emerald-500"
                      : activeToast.type === "error"
                      ? "bg-rose-500"
                      : activeToast.type === "info"
                      ? "bg-sky-500"
                      : "bg-white/20"
                  }`}
                />
              )}
              {activeToast.type ? iconMap[activeToast.type] : null}
            </div>

            {/* Text block */}
            <div className="flex flex-col min-w-0 pr-1">
              <span className="text-xs font-semibold tracking-tight text-neutral-100 truncate">
                {activeToast.title}
              </span>
              {activeToast.description && (
                <span className="text-[11px] leading-tight text-neutral-400 font-normal truncate mt-0.5">
                  {activeToast.description}
                </span>
              )}
            </div>

            {/* Optional action button or dismiss */}
            {activeToast.action ? (
              <button
                onClick={() => {
                  activeToast.action?.onClick();
                  islandToast.dismiss(activeToast.id);
                }}
                className="shrink-0 px-2.5 py-1 text-[11px] font-medium tracking-tight bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-full transition-all border border-white/10"
              >
                {activeToast.action.label}
              </button>
            ) : (
              <button
                onClick={() => islandToast.dismiss(activeToast.id)}
                className="shrink-0 p-1 text-neutral-400 hover:text-white rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}